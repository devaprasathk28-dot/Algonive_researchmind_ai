from sentence_transformers import (
    SentenceTransformer
)

from sklearn.metrics.pairwise import (
    cosine_similarity
)

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

DEFAULT_PAPER_DATABASE = [
    {
        "title": "Transformer-XL: Attentive Language Models Beyond a Fixed-Length Context",
        "abstract": "Transformer-XL learns dependency that is 80% longer than RNNs and 450% longer than vanilla Transformers, achieves better performance on language modeling, and is self-contained."
    },
    {
        "title": "Longformer: The Long-Document Transformer",
        "abstract": "We present Longformer with an attention mechanism that scales linearly with sequence length, making it easy to process documents of thousands of tokens or longer."
    },
    {
        "title": "DeBERTa: Decoding-enhanced BERT with Disentangled Attention",
        "abstract": "DeBERTa improves BERT and RoBERTa using disentangled attention and enhanced mask decoder, showing state-of-the-art results on NLU tasks."
    },
    {
        "title": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
        "abstract": "We introduce a new language representation model called BERT, which pre-trains deep bidirectional representations from unlabeled text."
    },
    {
        "title": "Attention Is All You Need",
        "abstract": "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely."
    }
]

def recommend_papers(
    query_text,
    query_entities=None,
    db=None,
    current_paper_id=None,
    paper_database=None
):
    if query_entities is None:
        query_entities = []

    # Get target entities set (lowercase MODEL, DATASET, FRAMEWORK, METHOD, TASK)
    target_types = {"MODEL", "DATASET", "FRAMEWORK", "METHOD", "TASK"}
    query_entity_set = {
        e["text"].lower().strip()
        for e in query_entities
        if e.get("type", e.get("label", "")).upper() in target_types
    }

    # Gather candidate papers
    candidates = []
    if db:
        from app.database import models
        # Fetch other papers from database
        query_expr = db.query(models.Paper)
        if current_paper_id is not None:
            query_expr = query_expr.filter(models.Paper.id != current_paper_id)
        db_papers = query_expr.all()
        for p in db_papers:
            candidates.append({
                "id": p.id,
                "title": p.title,
                "abstract": p.abstract or p.summary or p.full_text[:1000] or "",
                "is_db": True
            })

    # If database has few candidates, populate from DEFAULT_PAPER_DATABASE to ensure recommendations
    if not paper_database:
        paper_database = DEFAULT_PAPER_DATABASE

    seen_titles = {c["title"].lower().strip() for c in candidates}
    for dp in paper_database:
        title_lower = dp["title"].lower().strip()
        if title_lower not in seen_titles:
            candidates.append({
                "title": dp["title"],
                "abstract": dp["abstract"],
                "is_db": False
            })

    if not candidates:
        return []

    # Encode query text
    query_embedding = model.encode(query_text)

    scores = []
    from app.entity_extraction.entity_pipeline import run_entity_pipeline

    for cand in candidates:
        # 1. Cosine similarity of dense embeddings
        cand_abstract = cand["abstract"] or ""
        cand_embedding = model.encode(cand_abstract)

        text_sim = cosine_similarity(
            [query_embedding],
            [cand_embedding]
        )[0][0]
        text_sim = float(text_sim)

        # 2. Jaccard similarity of target entities
        cand_entities = []
        if cand.get("is_db") and db:
            from app.database import models
            db_ents = db.query(models.Entity).filter(models.Entity.paper_id == cand["id"]).all()
            cand_entities = [{"text": e.name, "type": e.entity_type} for e in db_ents]
        else:
            # Extract entities from the abstract
            if cand_abstract:
                cand_entities = run_entity_pipeline(cand_abstract)

        cand_entity_set = {
            e["text"].lower().strip()
            for e in cand_entities
            if e.get("type", e.get("label", "")).upper() in target_types
        }

        # Calculate Jaccard similarity
        if not query_entity_set and not cand_entity_set:
            jaccard_sim = 0.0
        else:
            intersection = query_entity_set.intersection(cand_entity_set)
            union = query_entity_set.union(cand_entity_set)
            jaccard_sim = len(intersection) / len(union) if len(union) > 0 else 0.0

        # Combine scores (70% text similarity, 30% Jaccard entity similarity)
        combined_score = 0.7 * text_sim + 0.3 * jaccard_sim

        scores.append({
            "title": cand["title"],
            "score": combined_score,
            "text_similarity": text_sim,
            "jaccard_similarity": jaccard_sim
        })

    scores.sort(key=lambda x: x["score"], reverse=True)
    return scores[:5]

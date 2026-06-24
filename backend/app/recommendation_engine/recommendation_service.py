import json
import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import models
from app.recommendation_engine.embedding_similarity import get_or_create_embedding, calculate_embedding_similarity
from app.recommendation_engine.entity_similarity import calculate_entity_similarity, extract_target_entities
from app.recommendation_engine.graph_similarity import build_graph, calculate_graph_similarity
from app.recommendation_engine.user_interest_engine import get_user_interests, calculate_interest_similarity
from app.recommendation_engine.recommendation_ranker import rank_recommendations
from app.recommendation_engine.arxiv_recommender import recommend_from_arxiv

# Import dataset, model, and gap recommenders
from app.recommendation_engine.dataset_recommender import recommend_datasets
from app.recommendation_engine.model_recommender import recommend_models
from app.recommendation_engine.gap_detector import detect_research_gaps
from app.recommendation_engine.topic_recommender import recommend_topics

logger = logging.getLogger(__name__)

def generate_and_save_hybrid_recommendations(
    parsed_paper: dict,
    db: Session,
    user_id: int = None
) -> dict:
    """
    Main pipeline service to score, rank, explain, and store recommendations for a research paper.
    """
    paper_id = parsed_paper.get("id")
    title = parsed_paper.get("title", "")
    abstract = parsed_paper.get("abstract", "") or ""
    
    # Extract query text content
    text = ""
    sections = parsed_paper.get("sections", {})
    if isinstance(sections, dict):
        for section in sections.values():
            if isinstance(section, str):
                text += section + " "
    elif isinstance(sections, list):
        for section in sections:
            if isinstance(section, str):
                text += section + " "
            elif isinstance(section, dict):
                text += section.get("content", "") + " "
    if not text.strip():
        text = abstract or title or ""

    query_text = (title + " " + abstract).strip()
    if not query_text:
        query_text = text[:800]

    # 1. Fetch query paper's properties (embedding, entities, graph)
    query_emb = []
    if paper_id:
        query_emb = get_or_create_embedding(int(paper_id), query_text, db)
    else:
        query_emb = get_or_create_embedding(0, query_text, None)

    # Load query entities
    query_entities = []
    if paper_id:
        db_ents = db.query(models.Entity).filter(models.Entity.paper_id == int(paper_id)).all()
        query_entities = [{"text": e.name, "type": e.entity_type} for e in db_ents]
    if not query_entities:
        from app.entity_extraction.entity_pipeline import run_entity_pipeline
        query_entities = run_entity_pipeline(text)

    # Load query graph
    query_graph_nx = None
    if paper_id:
        db_graph = db.query(models.KnowledgeGraph).filter(models.KnowledgeGraph.paper_id == int(paper_id)).first()
        if db_graph:
            try:
                nodes = json.loads(db_graph.nodes_json)
                edges = json.loads(db_graph.edges_json)
                query_graph_nx = build_graph(nodes, edges)
            except Exception:
                pass
    if query_graph_nx is None:
        query_graph_nx = build_graph([], [])

    # Load user interests
    user_interests = get_user_interests(user_id, db) if user_id else []

    # 2. Gather candidates (DB library + arXiv search)
    candidates = []
    
    # Candidate pool A: Database papers
    db_papers = db.query(models.Paper).all()
    for p in db_papers:
        if paper_id and p.id == int(paper_id):
            continue
        p_text = (p.title + " " + (p.abstract or p.summary or p.full_text[:800] or "")).strip()
        candidates.append({
            "id": p.id,
            "title": p.title,
            "abstract": p.abstract or p.summary or p.full_text[:800] or "",
            "text": p_text,
            "authors": [a.strip() for a in p.authors.split(",")] if p.authors else [],
            "is_db": True
        })

    # Candidate pool B: arXiv papers
    arxiv_papers = recommend_from_arxiv(title, text, query_entities, max_results=10)
    for ap in arxiv_papers:
        # Check if already in candidates by title
        seen_titles = {c["title"].lower().strip() for c in candidates}
        if ap["title"].lower().strip() not in seen_titles:
            ap_text = (ap["title"] + " " + ap["summary"]).strip()
            candidates.append({
                "title": ap["title"],
                "abstract": ap["summary"],
                "text": ap_text,
                "authors": ap["authors"],
                "pdf_url": ap.get("pdf_url"),
                "arxiv_url": ap.get("arxiv_url"),
                "is_db": False
            })

    # 3. Score all candidates using hybrid similarities
    scored_candidates = []
    for cand in candidates:
        cand_text = cand["text"]
        
        # A. Embedding Similarity
        cand_emb = []
        if cand.get("is_db"):
            cand_emb = get_or_create_embedding(cand["id"], cand_text, db)
        else:
            cand_emb = get_or_create_embedding(0, cand_text, None)
        emb_sim = calculate_embedding_similarity(query_emb, cand_emb)

        # B. Entity Similarity
        cand_entities = []
        if cand.get("is_db"):
            db_ents = db.query(models.Entity).filter(models.Entity.paper_id == cand["id"]).all()
            cand_entities = [{"text": e.name, "type": e.entity_type} for e in db_ents]
        else:
            from app.entity_extraction.entity_pipeline import run_entity_pipeline
            cand_entities = run_entity_pipeline(cand_text)
        ent_sim = calculate_entity_similarity(query_entities, cand_entities)

        # C. Graph Similarity
        grp_sim = 0.0
        if cand.get("is_db"):
            db_graph = db.query(models.KnowledgeGraph).filter(models.KnowledgeGraph.paper_id == cand["id"]).first()
            if db_graph:
                try:
                    c_nodes = json.loads(db_graph.nodes_json)
                    c_edges = json.loads(db_graph.edges_json)
                    cand_graph_nx = build_graph(c_nodes, c_edges)
                    grp_sim = calculate_graph_similarity(query_graph_nx, cand_graph_nx)
                except Exception:
                    pass

        # D. User Interest Similarity
        cand_topics = recommend_topics(cand_text)
        itr_sim = calculate_interest_similarity(cand_text, cand_topics, user_interests)

        # 4. Generate Explainable Reasons
        reasons = []
        if emb_sim > 0.65:
            reasons.append("High semantic content overlap")
        
        # Identify matching entities
        q_ent_names = extract_target_entities(query_entities)
        c_ent_names = extract_target_entities(cand_entities)
        shared = q_ent_names.intersection(c_ent_names)
        if shared:
            top_shared = list(shared)[:2]
            reasons.append(f"Shares academic entities: {', '.join(t.capitalize() for t in top_shared)}")
        
        if grp_sim > 0.4:
            reasons.append("Highly aligned knowledge graph relationship structure")
        
        # Identify matching user interests
        matched_interests = [i for i in user_interests if i.lower().strip() in cand_text.lower()]
        if matched_interests:
            reasons.append(f"Aligned with interest: {matched_interests[0]}")

        if not reasons:
            reasons.append("Related research context")

        scored_candidates.append({
            "title": cand["title"],
            "authors": cand.get("authors", []),
            "abstract": cand["abstract"],
            "pdf_url": cand.get("pdf_url"),
            "arxiv_url": cand.get("arxiv_url"),
            "is_db": cand.get("is_db", False),
            "embedding_similarity": float(emb_sim),
            "entity_similarity": float(ent_sim),
            "graph_similarity": float(grp_sim),
            "interest_similarity": float(itr_sim),
            "reasons": reasons,
            # Add placeholders for model/dataset suggestions per recommended paper
            "related_models": recommend_models(cand_text, cand_entities)[:4],
            "related_datasets": recommend_datasets(cand_text, cand_entities)[:4]
        })

    # Rank recommendations (returns top 10)
    ranked_recs = rank_recommendations(scored_candidates)

    # 5. Core aggregates for the main paper
    main_datasets = recommend_datasets(text, query_entities)
    main_models = recommend_models(text, query_entities)
    main_topics = recommend_topics(text)
    main_gaps = detect_research_gaps(text)

    # 6. Database Storage Persistence
    if db and paper_id:
        try:
            # Drop old recommendation rows for this paper
            db.query(models.Recommendation).filter(models.Recommendation.paper_id == int(paper_id)).delete()
            
            # Save new structured multi-row recommendation links
            for i, rec in enumerate(ranked_recs):
                # Save datasets, models, topics, and gaps in the first row to preserve compatibility
                db_rec = models.Recommendation(
                    paper_id=int(paper_id),
                    recommended_paper=rec["title"],
                    score=rec["score"],
                    reason=json.dumps(rec["reasons"]),
                    datasets=json.dumps(main_datasets) if i == 0 else "[]",
                    models=json.dumps(main_models) if i == 0 else "[]",
                    topics=json.dumps(main_topics) if i == 0 else "[]",
                    research_gaps=json.dumps(main_gaps) if i == 0 else "[]"
                )
                db.add(db_rec)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to persist recommendations in DB: {e}")
            db.rollback()

    return {
        "datasets": main_datasets,
        "models": main_models,
        "topics": main_topics,
        "research_gaps": main_gaps,
        "similar_papers": [
            {
                "title": r["title"],
                "authors": r["authors"],
                "abstract": r["abstract"],
                "pdf_url": r.get("pdf_url"),
                "arxiv_url": r.get("arxiv_url"),
                "score": r["score"],
                "reason": r["reasons"],
                "related_models": r["related_models"],
                "related_datasets": r["related_datasets"]
            }
            for r in ranked_recs
        ]
    }

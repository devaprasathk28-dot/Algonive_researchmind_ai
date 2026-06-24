import logging
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from app.classification.taxonomy import DOMAINS

logger = logging.getLogger(__name__)

# Initialize semantic model with all-mpnet-base-v2 and fallback to all-MiniLM-L6-v2
try:
    model = SentenceTransformer("all-mpnet-base-v2")
    logger.info("Loaded all-mpnet-base-v2 sentence-transformer successfully.")
except Exception as e:
    logger.warning(f"Could not load all-mpnet-base-v2: {e}. Falling back to all-MiniLM-L6-v2.")
    model = SentenceTransformer("all-MiniLM-L6-v2")

# Precompute domain embeddings to optimize lookup speeds
domain_embeddings = {
    domain: model.encode(domain)
    for domain in DOMAINS
}

def classify_domain(text: str) -> dict:
    """
    Compute domain classification by scoring text against precomputed domain embeddings.
    """
    if not text or not text.strip():
        return {"domain": "General Research", "confidence": 0.0}

    paper_embedding = model.encode(text)

    best_domain = None
    best_score = 0.0

    for domain, emb in domain_embeddings.items():
        similarity = cosine_similarity(
            [paper_embedding],
            [emb]
        )[0][0]
        similarity_score = float(similarity)

        if similarity_score > best_score:
            best_score = similarity_score
            best_domain = domain

    return {
        "domain": best_domain or "General Research",
        "confidence": round(best_score, 3)
    }

from app.classification.taxonomy import DOMAINS
from app.classification.domain_classifier import model
from sklearn.metrics.pairwise import cosine_similarity

# Precompute embeddings for all categories under their respective domains
category_embeddings = {}
for domain, categories in DOMAINS.items():
    category_embeddings[domain] = {
        cat: model.encode(cat)
        for cat in categories
    }

def classify_category(text: str, domain: str) -> dict:
    """
    Classify research category under the given domain by scoring similarity against category candidates.
    """
    if not text or not text.strip() or domain not in DOMAINS:
        return {"category": "Unclassified", "confidence": 0.0}

    paper_embedding = model.encode(text)

    best_category = None
    best_score = 0.0

    for cat, emb in category_embeddings[domain].items():
        similarity = cosine_similarity(
            [paper_embedding],
            [emb]
        )[0][0]
        similarity_score = float(similarity)

        if similarity_score > best_score:
            best_score = similarity_score
            best_category = cat

    return {
        "category": best_category or "Unclassified",
        "confidence": round(best_score, 3)
    }

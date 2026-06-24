def calculate_hybrid_score(
    embedding_sim: float,
    entity_sim: float,
    graph_sim: float,
    interest_sim: float
) -> float:
    """
    Apply the hybrid recommendation scoring formula.
    """
    score = (
        embedding_sim * 0.35 +
        entity_sim * 0.25 +
        graph_sim * 0.20 +
        interest_sim * 0.20
    )
    return round(score, 4)

def rank_recommendations(candidates: list) -> list:
    """
    Sort a list of candidates descending by hybrid recommendation score.
    Returns the top 10 candidate papers.
    """
    for c in candidates:
        if "score" not in c or "hybrid_score" not in c:
            emb = c.get("embedding_similarity", 0.0)
            ent = c.get("entity_similarity", 0.0)
            grp = c.get("graph_similarity", 0.0)
            itr = c.get("interest_similarity", 0.0)
            if emb == 0.0 and ent == 0.0 and grp == 0.0 and itr == 0.0 and "similarity_score" in c:
                score = c["similarity_score"]
            else:
                score = calculate_hybrid_score(emb, ent, grp, itr)
            c["score"] = score
            c["hybrid_score"] = score

    ranked = sorted(candidates, key=lambda x: x.get("hybrid_score", x.get("score", 0.0)), reverse=True)
    return ranked[:10]

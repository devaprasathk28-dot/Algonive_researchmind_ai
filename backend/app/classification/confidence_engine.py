def calculate_confidence(
    domain_score: float,
    category_score: float,
    entity_score: float
) -> float:
    """
    Compute confidence score by averaging domain, category, and entity coverage metrics.
    Bounds result between 0.0 and 1.0.
    """
    score = (domain_score + category_score + entity_score) / 3.0
    return round(max(0.0, min(1.0, score)), 3)

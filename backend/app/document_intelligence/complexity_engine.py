def calculate_complexity(
    equation_density: float,
    technical_density: float,
    method_count: int,
    entity_count: int,
    citation_density: float
) -> dict:
    """
    Weighted scoring for technical and mathematical complexity.
    """
    # Normalize inputs to 0-10 scale
    eq_score = min(equation_density * 5.0, 10.0)
    tech_score = min(technical_density * 200.0, 10.0)  # assume typical ML term density is ~5%
    meth_score = min(method_count / 3.0, 10.0)
    ent_score = min(entity_count / 15.0, 10.0)
    cit_score = min(citation_density * 20.0, 10.0)

    complexity_score = (
        eq_score * 0.2 +
        tech_score * 0.3 +
        meth_score * 0.2 +
        ent_score * 0.2 +
        cit_score * 0.1
    )

    complexity_score = round(max(0.0, min(10.0, complexity_score)), 2)

    if complexity_score < 3.0:
        level = "Basic"
    elif complexity_score < 6.0:
        level = "Intermediate"
    elif complexity_score < 8.0:
        level = "Advanced"
    else:
        level = "Research Grade"

    return {
        "score": complexity_score,
        "level": level
    }

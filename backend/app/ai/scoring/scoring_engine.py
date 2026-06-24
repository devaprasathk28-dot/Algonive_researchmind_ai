def generate_research_scores(text, critique):

    text_lower = text.lower()

    scores = {}

    # -----------------------------
    # Novelty Score
    # -----------------------------

    novelty_keywords = [
        "novel",
        "proposed",
        "innovative",
        "new approach"
    ]

    novelty_score = 0

    for keyword in novelty_keywords:
        if keyword in text_lower:
            novelty_score += 2

    scores["novelty"] = min(novelty_score, 10)

    # -----------------------------
    # Clarity Score
    # -----------------------------

    clarity_score = 7

    if len(text.split()) > 3000:
        clarity_score += 1

    scores["clarity"] = min(clarity_score, 10)

    # -----------------------------
    # Technical Quality
    # -----------------------------

    technical_keywords = [
        "algorithm",
        "architecture",
        "training",
        "evaluation",
        "model"
    ]

    technical_score = 0

    for keyword in technical_keywords:
        if keyword in text_lower:
            technical_score += 2

    scores["technical_quality"] = min(technical_score, 10)

    # -----------------------------
    # Reproducibility
    # -----------------------------

    reproducibility_score = critique["reproducibility"]["score"]

    scores["reproducibility"] = reproducibility_score

    # -----------------------------
    # Dataset Quality
    # -----------------------------

    dataset_score = 5

    if "dataset" in text_lower:
        dataset_score += 3

    if "benchmark" in text_lower:
        dataset_score += 2

    scores["dataset_quality"] = min(dataset_score, 10)

    # -----------------------------
    # Innovation Score
    # -----------------------------

    innovation_score = (
        scores["novelty"] +
        scores["technical_quality"]
    ) / 2

    scores["innovation"] = round(innovation_score, 1)

    # -----------------------------
    # Final Overall Score
    # -----------------------------

    final_score = (
        scores["novelty"] * 0.2 +
        scores["clarity"] * 0.15 +
        scores["technical_quality"] * 0.25 +
        scores["reproducibility"] * 0.2 +
        scores["dataset_quality"] * 0.2
    )

    scores["overall_score"] = round(final_score, 1)

    return scores

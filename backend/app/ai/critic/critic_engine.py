def analyze_research_paper(text):

    critique = {}

    text_lower = text.lower()

    # -------------------------------
    # Novelty Detection
    # -------------------------------

    novelty_keywords = [
        "novel",
        "proposed",
        "new approach",
        "innovative",
        "first time"
    ]

    novelty_score = 0

    for keyword in novelty_keywords:
        if keyword in text_lower:
            novelty_score += 2

    critique["novelty_analysis"] = {
        "score": min(novelty_score, 10),
        "comment": (
            "The paper demonstrates signs of innovation."
            if novelty_score > 4
            else "Limited novelty indicators detected."
        )
    }

    # -------------------------------
    # Dataset Analysis
    # -------------------------------

    if "dataset" in text_lower:
        critique["dataset_analysis"] = (
            "The paper includes dataset usage information."
        )
    else:
        critique["dataset_analysis"] = (
            "Dataset details appear limited."
        )

    # -------------------------------
    # Overfitting Risk
    # -------------------------------

    if "accuracy" in text_lower and "validation" not in text_lower:
        critique["overfitting_risk"] = (
            "Potential overfitting risk detected due to limited validation discussion."
        )
    else:
        critique["overfitting_risk"] = (
            "No major overfitting indicators detected."
        )

    # -------------------------------
    # Reproducibility
    # -------------------------------

    reproducibility_keywords = [
        "hyperparameter",
        "implementation",
        "training details",
        "experimental setup"
    ]

    reproducibility_score = 0

    for keyword in reproducibility_keywords:
        if keyword in text_lower:
            reproducibility_score += 2

    critique["reproducibility"] = {
        "score": min(reproducibility_score, 10),
        "comment": (
            "Research appears reasonably reproducible."
            if reproducibility_score >= 4
            else "Limited reproducibility details detected."
        )
    }

    # -------------------------------
    # Limitation Detection
    # -------------------------------

    limitations = []

    limitation_keywords = [
        "however",
        "limitation",
        "future work",
        "challenge",
        "drawback"
    ]

    for keyword in limitation_keywords:
        if keyword in text_lower:
            limitations.append(
                f"Potential limitation discussion detected using keyword: '{keyword}'"
            )

    critique["limitations"] = limitations[:5]

    # -------------------------------
    # Final Verdict
    # -------------------------------

    critique["final_verdict"] = (
        "The paper demonstrates promising research quality with moderate technical depth."
    )

    return critique

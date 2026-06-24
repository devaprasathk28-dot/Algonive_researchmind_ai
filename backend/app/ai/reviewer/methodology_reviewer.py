def review_methodology(text):

    text_lower = text.lower()

    comments = []

    score = 6

    methodology_keywords = [
        "architecture",
        "training",
        "evaluation",
        "experiment",
        "benchmark"
    ]

    for keyword in methodology_keywords:

        if keyword in text_lower:
            score += 1

    if "ablation" not in text_lower:

        comments.append(
            "Ablation studies are missing."
        )

    comments.append(
        "Methodology appears technically sound."
    )

    return {

        "methodology_score":
            min(score, 10),

        "review_comments":
            comments
    }

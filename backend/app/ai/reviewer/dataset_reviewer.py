def review_dataset_quality(text):

    text_lower = text.lower()

    comments = []

    score = 5

    if "dataset" in text_lower:
        score += 2

    if "benchmark" in text_lower:
        score += 2

    if "small dataset" in text_lower:

        comments.append(
            "Dataset size may limit generalization."
        )

    comments.append(
        "Dataset evaluation appears reasonable."
    )

    return {

        "dataset_score":
            min(score, 10),

        "review_comments":
            comments
    }

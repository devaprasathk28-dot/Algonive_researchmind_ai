def review_novelty(text):

    text_lower = text.lower()

    score = 5

    comments = []

    novelty_keywords = [
        "novel",
        "innovative",
        "proposed",
        "new approach"
    ]

    for keyword in novelty_keywords:

        if keyword in text_lower:
            score += 1

    if score >= 8:

        comments.append(
            "The paper demonstrates strong novelty and innovation."
        )

    else:

        comments.append(
            "The paper shows moderate novelty."
        )

    return {

        "novelty_score":
            min(score, 10),

        "review_comments":
            comments
    }

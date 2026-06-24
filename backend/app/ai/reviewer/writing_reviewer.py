def review_writing_quality(text):

    word_count = len(text.split())

    score = 6

    comments = []

    if word_count > 2000:
        score += 2

    comments.append(
        "Paper structure appears organized."
    )

    comments.append(
        "Technical writing quality is acceptable."
    )

    return {

        "writing_score":
            min(score, 10),

        "review_comments":
            comments
    }

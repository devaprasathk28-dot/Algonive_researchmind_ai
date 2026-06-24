def generate_literature_review(
    themes,
    papers
):

    review = "Literature Review\n\n"

    review += (
        "Recent research studies have explored "
    )

    review += ", ".join(themes)

    review += (
        " across multiple domains.\n\n"
    )

    review += (
        "Several papers demonstrate strong "
        "performance improvements using "
        "advanced AI architectures.\n\n"
    )

    review += (
        "Transformer-based approaches "
        "have shown significant advancements "
        "in contextual understanding "
        "and feature extraction.\n\n"
    )

    review += (
        "Researchers continue exploring "
        "scalable and multimodal AI systems."
    )

    return review

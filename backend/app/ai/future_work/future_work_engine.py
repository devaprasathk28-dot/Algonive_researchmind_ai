def generate_future_work(text):

    text_lower = text.lower()

    future_work = []

    # ---------------------------------
    # Scalability Suggestions
    # ---------------------------------

    if "small dataset" in text_lower:
        future_work.append(
            "Future work could involve training on larger-scale datasets."
        )

    # ---------------------------------
    # Model Improvement Suggestions
    # ---------------------------------

    if "cnn" in text_lower:
        future_work.append(
            "Transformer-based architectures could be explored for improved contextual learning."
        )

    if "lstm" in text_lower:
        future_work.append(
            "Attention mechanisms may improve sequence understanding."
        )

    # ---------------------------------
    # Performance Suggestions
    # ---------------------------------

    if "accuracy" in text_lower:
        future_work.append(
            "Hyperparameter optimization may further improve model performance."
        )

    # ---------------------------------
    # General Research Expansion
    # ---------------------------------

    future_work.append(
        "Cross-domain evaluation could improve generalization capability."
    )

    future_work.append(
        "Real-world deployment scenarios should be explored."
    )

    return future_work

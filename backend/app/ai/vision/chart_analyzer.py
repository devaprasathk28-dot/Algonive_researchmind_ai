def analyze_chart_text(ocr_text):

    analysis = []

    text_lower = ocr_text.lower()

    if "accuracy" in text_lower:
        analysis.append(
            "Chart likely represents model accuracy trends."
        )

    if "loss" in text_lower:
        analysis.append(
            "Loss curve detected, useful for convergence analysis."
        )

    if "epoch" in text_lower:
        analysis.append(
            "Training progression over epochs identified."
        )

    if "precision" in text_lower:
        analysis.append(
            "Precision metric comparison detected."
        )

    return analysis

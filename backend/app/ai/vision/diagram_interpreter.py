def interpret_diagram(ocr_text):

    interpretation = []

    text_lower = ocr_text.lower()

    if "input" in text_lower and "output" in text_lower:
        interpretation.append(
            "Workflow pipeline detected with input-output flow."
        )

    if "cnn" in text_lower:
        interpretation.append(
            "CNN architecture diagram identified."
        )

    if "transformer" in text_lower:
        interpretation.append(
            "Transformer-based architecture detected."
        )

    if "encoder" in text_lower:
        interpretation.append(
            "Encoder module identified in architecture."
        )

    return interpretation

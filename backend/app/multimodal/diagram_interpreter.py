def interpret_diagram(
    extracted_text
):
    interpretations = []
    lower_text = extracted_text.lower()

    if "encoder" in lower_text:
        interpretations.append(
            "Encoder architecture component detected."
        )

    if "decoder" in lower_text:
        interpretations.append(
            "Decoder pipeline detected."
        )

    if "cnn" in lower_text:
        interpretations.append(
            "CNN architecture identified."
        )

    if "transformer" in lower_text:
        interpretations.append(
            "Transformer architecture identified."
        )

    return {
        "diagram_analysis":
            interpretations
    }

def detect_biases(
    paper_text
):

    bias_risks = []

    lower_text = paper_text.lower()

    if "small dataset" in lower_text:

        bias_risks.append(
            "Small dataset risk"
        )

    if "limited samples" in lower_text:

        bias_risks.append(
            "Limited sample size"
        )

    if "single domain" in lower_text:

        bias_risks.append(
            "Single-domain bias"
        )

    return {

        "detected_biases":
            bias_risks,

        "risk_level":
            "moderate"
            if bias_risks
            else "low"
    }

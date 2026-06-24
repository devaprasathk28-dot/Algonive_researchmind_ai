def analyze_chart(
    extracted_text
):
    chart_analysis = {
        "chart_type":
            "unknown",
        "possible_trends": []
    }

    lower_text = extracted_text.lower()

    if "accuracy" in lower_text:
        chart_analysis[
            "possible_trends"
        ].append(
            "Accuracy-related evaluation detected."
        )

    if "loss" in lower_text:
        chart_analysis[
            "possible_trends"
        ].append(
            "Training loss trend detected."
        )

    if "epoch" in lower_text:
        chart_analysis[
            "possible_trends"
        ].append(
            "Epoch-based training graph detected."
        )

    return chart_analysis

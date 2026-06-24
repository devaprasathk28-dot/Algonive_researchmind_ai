def analyze_table_text(ocr_text):

    insights = []

    text_lower = ocr_text.lower()

    if "%" in ocr_text:
        insights.append(
            "Performance percentage values detected."
        )

    if "accuracy" in text_lower:
        insights.append(
            "Table contains accuracy comparison metrics."
        )

    if "dataset" in text_lower:
        insights.append(
            "Dataset evaluation table identified."
        )

    return insights

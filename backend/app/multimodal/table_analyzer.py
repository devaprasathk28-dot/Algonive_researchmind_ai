def analyze_table(
    extracted_text
):
    findings = []
    lower_text = extracted_text.lower()

    if "accuracy" in lower_text:
        findings.append(
            "Performance metrics identified."
        )

    if "%" in extracted_text:
        findings.append(
            "Percentage-based evaluation found."
        )

    if "dataset" in lower_text:
        findings.append(
            "Dataset comparison table detected."
        )

    return {
        "table_findings":
            findings
    }

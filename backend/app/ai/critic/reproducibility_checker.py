def evaluate_reproducibility(
    sections
):

    methodology = sections.get(
        "methodology",
        ""
    )

    results = sections.get(
        "results",
        ""
    )

    reproducibility_score = 5

    if len(methodology) > 1000:
        reproducibility_score += 2

    if len(results) > 1000:
        reproducibility_score += 1

    return {

        "score":
            reproducibility_score,

        "analysis":
            "Methodology and results sections provide moderate reproducibility."
    }

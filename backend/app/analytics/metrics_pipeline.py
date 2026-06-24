from app.analytics.metrics_calculator import (
    calculate_metrics
)

def generate_metrics(
    parsed_paper
):

    metrics = calculate_metrics(
        parsed_paper
    )

    score = 0

    if metrics["words"] > 5000:
        score += 3

    if metrics["references"] > 20:
        score += 3

    if metrics["figures"] > 5:
        score += 2

    if metrics["tables"] > 3:
        score += 2

    if score >= 8:
        complexity = "Advanced"

    elif score >= 5:
        complexity = "Intermediate"

    else:
        complexity = "Basic"

    metrics["complexity"] = complexity

    return metrics

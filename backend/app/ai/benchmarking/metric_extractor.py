import re

def extract_performance_metrics(text):

    metrics = {}

    accuracy_pattern = r'(\d+(\.\d+)?)%'

    accuracies = re.findall(
        accuracy_pattern,
        text
    )

    extracted_scores = []

    for match in accuracies:

        extracted_scores.append(
            float(match[0])
        )

    metrics["accuracy_scores"] = (
        extracted_scores
    )

    return metrics

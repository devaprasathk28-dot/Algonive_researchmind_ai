import re

def extract_metrics(text):

    metrics = {}

    text_lower = text.lower()

    # -----------------------------
    # Accuracy Extraction
    # -----------------------------

    accuracy_pattern = r'(\d+(\.\d+)?)%'

    accuracies = re.findall(
        accuracy_pattern,
        text
    )

    extracted_accuracies = []

    for match in accuracies:
        extracted_accuracies.append(
            float(match[0])
        )

    metrics["accuracies"] = extracted_accuracies

    # -----------------------------
    # Dataset Detection
    # -----------------------------

    if "dataset" in text_lower:
        metrics["dataset_used"] = True
    else:
        metrics["dataset_used"] = False

    # -----------------------------
    # Architecture Detection
    # -----------------------------

    architectures = []

    architecture_keywords = [
        "cnn",
        "transformer",
        "lstm",
        "bert",
        "gan",
        "resnet"
    ]

    for keyword in architecture_keywords:

        if keyword in text_lower:
            architectures.append(keyword)

    metrics["architectures"] = architectures

    return metrics

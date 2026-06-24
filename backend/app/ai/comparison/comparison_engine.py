from app.ai.comparison.metric_extractor import (
    extract_metrics
)

def compare_papers(paper_a, paper_b):

    comparison = {}

    metrics_a = extract_metrics(paper_a)

    metrics_b = extract_metrics(paper_b)

    # -----------------------------------
    # Accuracy Comparison
    # -----------------------------------

    acc_a = (
        max(metrics_a["accuracies"])
        if metrics_a["accuracies"]
        else 0
    )

    acc_b = (
        max(metrics_b["accuracies"])
        if metrics_b["accuracies"]
        else 0
    )

    if acc_a > acc_b:
        better_accuracy = "Paper A"
    elif acc_b > acc_a:
        better_accuracy = "Paper B"
    else:
        better_accuracy = "Equal"

    comparison["accuracy_comparison"] = {
        "paper_a_best_accuracy": acc_a,
        "paper_b_best_accuracy": acc_b,
        "better_paper": better_accuracy
    }

    # -----------------------------------
    # Architecture Comparison
    # -----------------------------------

    comparison["architecture_comparison"] = {
        "paper_a_architectures":
            metrics_a["architectures"],

        "paper_b_architectures":
            metrics_b["architectures"]
    }

    # -----------------------------------
    # Dataset Comparison
    # -----------------------------------

    comparison["dataset_comparison"] = {
        "paper_a_uses_dataset":
            metrics_a["dataset_used"],

        "paper_b_uses_dataset":
            metrics_b["dataset_used"]
    }

    # -----------------------------------
    # Final Verdict
    # -----------------------------------

    comparison["final_analysis"] = (
        "Paper comparison completed successfully."
    )

    return comparison

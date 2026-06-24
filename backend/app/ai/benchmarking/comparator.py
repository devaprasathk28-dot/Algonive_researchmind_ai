from app.ai.benchmarking.sota_database import (
    SOTA_BENCHMARKS
)

def compare_with_sota(
    datasets,
    metrics
):

    comparisons = []

    paper_best_score = 0

    if metrics["accuracy_scores"]:

        paper_best_score = max(
            metrics["accuracy_scores"]
        )

    for dataset in datasets:

        if dataset in SOTA_BENCHMARKS:

            sota = SOTA_BENCHMARKS[dataset]

            gap = (
                sota["best_accuracy"]
                - paper_best_score
            )

            comparisons.append({

                "dataset":
                    dataset,

                "paper_score":
                    paper_best_score,

                "sota_model":
                    sota["best_model"],

                "sota_score":
                    sota["best_accuracy"],

                "performance_gap":
                    round(gap, 2)
            })

    return comparisons

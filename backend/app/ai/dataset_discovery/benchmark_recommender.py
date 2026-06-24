def recommend_benchmark_datasets(
    datasets
):

    benchmark_recommendations = []

    for dataset in datasets:

        benchmark_recommendations.append({

            "dataset":
                dataset["name"],

            "benchmark_suitability":
                "High",

            "recommended_for":
                dataset["type"]
        })

    return benchmark_recommendations

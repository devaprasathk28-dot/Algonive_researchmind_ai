def analyze_dataset_suitability(
    datasets
):

    analysis = []

    for dataset in datasets:

        analysis.append({

            "dataset":
                dataset["name"],

            "analysis":
                f"{dataset['name']} is suitable for {dataset['type']} research tasks."
        })

    return analysis

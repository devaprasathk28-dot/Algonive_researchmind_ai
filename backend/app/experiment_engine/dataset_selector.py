def select_experiment_datasets(
    research_goal
):

    goal = research_goal.lower()

    datasets = []

    if "medical" in goal:

        datasets.append(
            "MIMIC-CXR"
        )

    if "vision" in goal:

        datasets.append(
            "ImageNet"
        )

    if "language" in goal:

        datasets.append(
            "GLUE"
        )

    if "rag" in goal:

        datasets.append(
            "MS MARCO"
        )

    if not datasets:

        datasets.append(
            "General Benchmark Dataset"
        )

    return datasets

def detect_benchmark_datasets(text):

    text_lower = text.lower()

    datasets = []

    benchmark_datasets = [

        "imagenet",
        "cifar",
        "mnist",
        "coco",
        "squad",
        "glue",
        "mimic"
    ]

    for dataset in benchmark_datasets:

        if dataset in text_lower:

            datasets.append(dataset)

    return datasets

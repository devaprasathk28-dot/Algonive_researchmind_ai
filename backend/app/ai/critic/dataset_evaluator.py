def evaluate_dataset_quality(
    paper_text
):

    dataset_score = 7

    lower_text = paper_text.lower()

    if "benchmark" in lower_text:
        dataset_score += 1

    if "large-scale" in lower_text:
        dataset_score += 1

    return {

        "dataset_score":
            min(dataset_score, 10),

        "analysis":
            "Dataset quality appears acceptable for evaluation."
    }

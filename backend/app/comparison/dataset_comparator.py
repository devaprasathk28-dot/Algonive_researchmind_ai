import re

def compare_datasets(text_a, text_b):

    datasets_a = re.findall(
        r"[A-Z][A-Za-z0-9\-]+",
        text_a
    )

    datasets_b = re.findall(
        r"[A-Z][A-Za-z0-9\-]+",
        text_b
    )

    return {

        "paper_a_datasets":
            list(set(datasets_a))[:10],

        "paper_b_datasets":
            list(set(datasets_b))[:10]
    }

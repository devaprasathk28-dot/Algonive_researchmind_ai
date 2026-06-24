import re

def extract_metrics(text):

    percentages = re.findall(

        r"\d+(?:\.\d+)?%",

        text
    )

    return percentages

def compare_performance(

    text_a,
    text_b
):

    return {

        "paper_a_metrics":
            extract_metrics(text_a),

        "paper_b_metrics":
            extract_metrics(text_b)
    }

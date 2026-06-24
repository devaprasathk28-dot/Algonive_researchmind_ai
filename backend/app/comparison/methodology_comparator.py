def compare_methodologies(paper_a, paper_b):

    method_a = paper_a["sections"].get(
        "methodology", ""
    )

    method_b = paper_b["sections"].get(
        "methodology", ""
    )

    return {
        "paper_a_methodology":
            method_a[:1000],

        "paper_b_methodology":
            method_b[:1000]
    }

from app.comparison.methodology_comparator import (
    compare_methodologies
)

from app.comparison.dataset_comparator import (
    compare_datasets
)

from app.comparison.performance_comparator import (
    compare_performance
)

def compare_two_papers(

    paper_a,
    paper_b
):

    text_a = "\n".join(

        paper_a["sections"].values()
    )

    text_b = "\n".join(

        paper_b["sections"].values()
    )

    return {

        "methodology":

            compare_methodologies(

                paper_a,
                paper_b
            ),

        "datasets":

            compare_datasets(

                text_a,
                text_b
            ),

        "performance":

            compare_performance(

                text_a,
                text_b
            )
    }

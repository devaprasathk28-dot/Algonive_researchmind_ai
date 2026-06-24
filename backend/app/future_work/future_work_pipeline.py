from app.future_work.future_work_generator import (
    generate_future_work
)

from app.future_work.recommendation_engine import (
    generate_recommendations
)

def run_future_work_pipeline(
    parsed_paper
):

    full_text = ""

    for section in parsed_paper.get(
        "sections",
        {}
    ).values():

        full_text += section

    ai_future_work = (
        generate_future_work(
            full_text
        )
    )

    recommendations = (
        generate_recommendations(
            full_text
        )
    )

    return {

        "future_work":
            ai_future_work,

        "recommendations":
            recommendations
    }

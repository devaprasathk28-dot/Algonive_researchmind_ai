def analyze_performance(
    feedback_database
):

    if not feedback_database:

        return {

            "average_score":
                0,

            "performance_status":
                "No Data"
        }

    total_score = sum(

        item["score"]

        for item in feedback_database
    )

    average_score = (
        total_score /
        len(feedback_database)
    )

    status = (

        "Excellent"

        if average_score >= 8 else

        "Needs Improvement"
    )

    return {

        "average_score":
            round(average_score, 2),

        "performance_status":
            status
    }

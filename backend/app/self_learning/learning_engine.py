def generate_learning_insights(
    performance
):

    insights = []

    if performance[
        "average_score"
    ] < 8:

        insights.append(

            "Increase reasoning depth."
        )

        insights.append(

            "Improve contextual understanding."
        )

    else:

        insights.append(

            "Current reasoning quality is strong."
        )

    return insights

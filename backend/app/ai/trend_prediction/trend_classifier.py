def classify_research_trends(
    growth_predictions
):

    classifications = {}

    for topic, data in growth_predictions.items():

        score = data["growth_score"]

        if score >= 40:

            trend = "Dominant Future Trend"

        elif score >= 20:

            trend = "Rapidly Growing"

        else:

            trend = "Emerging Research Area"

        classifications[topic] = trend

    return classifications

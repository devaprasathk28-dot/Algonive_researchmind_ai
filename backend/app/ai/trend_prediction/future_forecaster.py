def generate_future_predictions(
    classifications
):

    forecasts = []

    for topic, trend in classifications.items():

        if trend == "Dominant Future Trend":

            forecasts.append(
                f"{topic} is expected to dominate future AI research."
            )

        elif trend == "Rapidly Growing":

            forecasts.append(
                f"{topic} is projected to experience strong growth in upcoming years."
            )

        else:

            forecasts.append(
                f"{topic} represents an emerging research direction."
            )

    return forecasts

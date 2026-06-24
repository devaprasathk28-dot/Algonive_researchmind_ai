def generate_recommendations(
    text
):

    recommendations = []

    text = text.lower()

    if "machine learning" in text:

        recommendations.append(
            "Explore deep learning architectures."
        )

    if "cryptocurrency" in text:

        recommendations.append(
            "Add market sentiment analysis."
        )

        recommendations.append(
            "Integrate portfolio intelligence."
        )

    if "rag" in text:

        recommendations.append(
            "Implement hybrid retrieval."
        )

    if not recommendations:

        recommendations.append(
            "Expand datasets for broader evaluation."
        )

    return recommendations

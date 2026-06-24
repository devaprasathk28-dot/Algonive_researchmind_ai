def generate_personalized_recommendations(
    interests
):

    recommendations = []

    for interest in interests:

        recommendations.append({

            "topic":
                interest,

            "recommendation":
                f"Recommended papers and datasets for {interest}."
        })

    return recommendations

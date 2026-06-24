def adapt_system_behavior(
    insights
):

    adaptations = []

    for insight in insights:

        adaptations.append({

            "adaptation":
                insight,

            "status":
                "applied"
        })

    return adaptations

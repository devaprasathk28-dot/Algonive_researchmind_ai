def adaptive_reasoning_engine(
    query,
    profile
):

    interests = profile[
        "research_interests"
    ]

    reasoning = {

        "query":
            query,

        "adaptive_response":
            f"Based on your interest in {', '.join(interests)}, this research direction is highly relevant.",

        "reasoning_mode":
            "Personalized Scientific Guidance"
    }

    return reasoning

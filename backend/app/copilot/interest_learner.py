def learn_user_interests(
    profile
):

    interests = profile[
        "research_interests"
    ]

    learning_model = {

        "primary_interest":
            interests[0]
            if interests else
            "General AI",

        "interest_count":
            len(interests),

        "personalization_level":
            "Adaptive"
    }

    return learning_model

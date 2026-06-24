def build_user_profile(
    user_history
):

    profile = {

        "research_interests": [],

        "preferred_domains": [],

        "activity_level":
            "Intermediate"
    }

    keywords = {

        "transformer":
            "Transformers",

        "multimodal":
            "Multimodal AI",

        "rag":
            "RAG Systems",

        "vision":
            "Computer Vision",

        "agent":
            "AI Agents",

        "llm":
            "Large Language Models"
    }

    for item in user_history:

        text = item.lower()

        for keyword, topic in keywords.items():

            if keyword in text:

                profile[
                    "research_interests"
                ].append(topic)

    profile[
        "research_interests"
    ] = list(set(

        profile["research_interests"]
    ))

    return profile

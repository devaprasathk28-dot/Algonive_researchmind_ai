def build_user_interest_profile(
    research_history
):

    interests = []

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

    for research in research_history:

        text = research.lower()

        for keyword, topic in keywords.items():

            if keyword in text:

                interests.append(topic)

    return list(set(interests))

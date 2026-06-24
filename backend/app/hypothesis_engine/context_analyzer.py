def analyze_research_context(
    text
):

    context = {

        "research_domains": [],

        "detected_topics": [],

        "complexity_level":
            "Advanced"
    }

    keywords = {

        "transformer":
            "Transformers",

        "multimodal":
            "Multimodal AI",

        "rag":
            "RAG Systems",

        "agent":
            "AI Agents",

        "graph":
            "Graph AI",

        "vision":
            "Computer Vision"
    }

    text_lower = text.lower()

    for keyword, topic in keywords.items():

        if keyword in text_lower:

            context[
                "detected_topics"
            ].append(topic)

    return context

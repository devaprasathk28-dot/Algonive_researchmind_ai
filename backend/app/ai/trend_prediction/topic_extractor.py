def extract_research_topics(text):

    topics = []

    text_lower = text.lower()

    topic_keywords = {

        "transformer":
            "Transformers",

        "rag":
            "RAG Systems",

        "llm":
            "Large Language Models",

        "vision":
            "Computer Vision",

        "multimodal":
            "Multimodal AI",

        "graph":
            "Graph AI",

        "agent":
            "AI Agents",

        "cnn":
            "CNN Architectures"
    }

    for keyword, topic in topic_keywords.items():

        if keyword in text_lower:
            topics.append(topic)

    return list(set(topics))

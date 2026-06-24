def analyze_research_topics(
    papers
):

    topics = []

    keywords = {

        "transformer":
            "Transformers",

        "multimodal":
            "Multimodal AI",

        "rag":
            "RAG Systems",

        "llm":
            "Large Language Models",

        "vision":
            "Computer Vision",

        "agent":
            "AI Agents"
    }

    for paper in papers:

        text = (
            paper["title"] + " " +
            paper["summary"]
        ).lower()

        for keyword, topic in keywords.items():

            if keyword in text:

                topics.append(topic)

    return topics

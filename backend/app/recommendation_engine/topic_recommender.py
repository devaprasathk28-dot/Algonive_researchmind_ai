def recommend_topics(
    text
):

    topics = []

    text = text.lower()

    if "rag" in text or "retrieval" in text or "search" in text or "vector" in text or "qa" in text:

        topics.extend([

            "Agentic RAG",

            "Multimodal RAG",

            "Graph RAG"
        ])

    if "transformer" in text or "attention" in text or "language model" in text or "nlp" in text or "translation" in text or "text" in text:

        topics.extend([

            "Long Context Models",

            "Efficient Attention",

            "MoE Architectures"
        ])

    if not topics:
        topics.extend([
            "Efficient Attention",
            "Long Context Models",
            "Agentic RAG"
        ])

    seen = set()
    res = []
    for t in topics:
        if t not in seen:
            seen.add(t)
            res.append(t)

    return res

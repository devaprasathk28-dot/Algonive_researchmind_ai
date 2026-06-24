def detect_intent(
    message: str
):

    message = message.lower()

    if "summary" in message:
        return "summary"

    if "critique" in message:
        return "critique"

    if "future work" in message:
        return "future_work"

    if "knowledge graph" in message:
        return "knowledge_graph"

    if "ppt" in message:
        return "ppt"

    if "literature review" in message:
        return "literature_review"

    return "rag_chat"

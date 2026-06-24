def detect_research_gaps(
    context
):

    gaps = []

    topics = context[
        "detected_topics"
    ]

    if "Multimodal AI" in topics:

        gaps.append(
            "Limited multimodal reasoning for scientific research."
        )

    if "AI Agents" in topics:

        gaps.append(
            "Lack of autonomous collaborative research agents."
        )

    if "RAG Systems" in topics:

        gaps.append(
            "Insufficient multimodal retrieval integration."
        )

    return gaps

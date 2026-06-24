def recommend_models(
    research_goal
):

    goal = research_goal.lower()

    models = []

    if "transformer" in goal:

        models.append(
            "Vision Transformer"
        )

    if "multimodal" in goal:

        models.append(
            "CLIP"
        )

    if "rag" in goal:

        models.append(
            "RAG Architecture"
        )

    if "agent" in goal:

        models.append(
            "Multi-Agent Framework"
        )

    if not models:

        models.append(
            "Baseline Transformer"
        )

    return models

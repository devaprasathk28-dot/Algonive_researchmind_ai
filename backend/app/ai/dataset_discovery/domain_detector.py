def detect_research_domain(text):

    text_lower = text.lower()

    if "medical" in text_lower:
        return "medical_ai"

    elif "nlp" in text_lower:
        return "natural_language_processing"

    elif "vision" in text_lower:
        return "computer_vision"

    elif "rag" in text_lower:
        return "retrieval_augmented_generation"

    elif "graph" in text_lower:
        return "graph_ai"

    return "general_ai"

def extract_research_themes(text):

    themes = []

    text_lower = text.lower()

    theme_keywords = {

        "transformers":
            "Transformer Architectures",

        "cnn":
            "Convolutional Neural Networks",

        "medical":
            "Medical Imaging",

        "rag":
            "Retrieval-Augmented Generation",

        "nlp":
            "Natural Language Processing",

        "vision":
            "Computer Vision"
    }

    for keyword, theme in theme_keywords.items():

        if keyword in text_lower:
            themes.append(theme)

    return list(set(themes))

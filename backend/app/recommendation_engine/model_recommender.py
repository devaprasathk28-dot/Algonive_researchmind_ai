def recommend_models(
    text,
    entities=None
):
    if entities is None:
        entities = []

    models = []

    # Add entities of type MODEL first
    for e in entities:
        if e.get("type", e.get("label", "")).upper() == "MODEL":
            models.append(e["text"])

    text = text.lower()

    if "nlp" in text or "language" in text or "transformer" in text or "translation" in text or "text" in text or "attention" in text:
        models.extend([
            "BERT",
            "RoBERTa",
            "DeBERTa",
            "LLaMA"
        ])

    if "computer vision" in text or "vision" in text or "image" in text or "cnn" in text or "detection" in text:
        models.extend([
            "ViT",
            "EfficientNet",
            "ResNet"
        ])

    if "rag" in text or "retrieval" in text or "search" in text or "vector" in text or "qa" in text:
        models.extend([
            "Mistral",
            "Llama-3",
            "Gemma"
        ])

    if not models:
        models.extend([
            "BERT",
            "ViT",
            "Mistral"
        ])

    seen = set()
    res = []
    for m in models:
        m_clean = m.strip()
        m_lower = m_clean.lower()
        if m_lower not in seen and m_clean:
            seen.add(m_lower)
            res.append(m_clean)

    return res

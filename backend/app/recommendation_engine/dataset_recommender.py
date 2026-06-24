def recommend_datasets(
    text,
    entities=None
):
    if entities is None:
        entities = []

    datasets = []

    # Add entities of type DATASET first
    for e in entities:
        if e.get("type", e.get("label", "")).upper() == "DATASET":
            datasets.append(e["text"])

    text = text.lower()

    if "computer vision" in text or "vision" in text or "image" in text or "cnn" in text or "detection" in text:
        datasets.extend([
            "ImageNet",
            "COCO",
            "CIFAR-10"
        ])

    if "nlp" in text or "language" in text or "transformer" in text or "translation" in text or "text" in text or "attention" in text:
        datasets.extend([
            "WikiText",
            "SQuAD",
            "Common Crawl"
        ])

    if "rag" in text or "retrieval" in text or "search" in text or "vector" in text or "qa" in text:
        datasets.extend([
            "HotpotQA",
            "MS MARCO",
            "Natural Questions"
        ])

    if not datasets:
        datasets.extend([
            "WikiText",
            "ImageNet",
            "SQuAD"
        ])

    # Remove duplicates preserving order
    seen = set()
    res = []
    for d in datasets:
        d_clean = d.strip()
        d_lower = d_clean.lower()
        if d_lower not in seen and d_clean:
            seen.add(d_lower)
            res.append(d_clean)

    return res

def classify_paper(text: str, entities: list = None) -> dict:
    if entities is None:
        entities = []

    text_lower = text.lower()

    # Rule 1: Financial Technology / Cryptography
    crypto_keywords = {"cryptocurrency", "dex", "liquidity", "trading", "bitcoin", "ethereum", "blockchain", "defi"}
    has_crypto_entity = any(e["text"].lower() in crypto_keywords for e in entities)
    has_crypto_text = any(kw in text_lower for kw in crypto_keywords)

    if has_crypto_entity or has_crypto_text:
        extracted_kws = [e["text"] for e in entities if e["text"].lower() in crypto_keywords or e["type"] in ("MODEL", "METHOD", "DATASET")][:6]
        if not extracted_kws:
            extracted_kws = ["Crypto", "Trading", "Analytics", "WebSockets"]
        return {
            "category": "Financial Technology",
            "subCategory": "Cryptocurrency Analytics",
            "domain": "Data Analytics",
            "applicationArea": "Investment Intelligence",
            "difficulty": "Advanced",
            "keywords": list(set(extracted_kws))
        }

    # Rule 2: Artificial Intelligence / Machine Learning
    ai_keywords = {"transformer", "attention", "language model", "bert", "gpt", "llama", "resnet", "neural network", "deep learning", "machine learning", "cnn", "rnn"}
    has_ai_entity = any(e["text"].lower() in ai_keywords or e["type"] in ("MODEL", "FRAMEWORK") for e in entities)
    has_ai_text = any(kw in text_lower for kw in ai_keywords)

    if has_ai_entity or has_ai_text:
        # Check sub-fields
        cv_keywords = {"vision", "image", "object detection", "segmentation", "cnn", "resnet", "yolo", "coco", "imagenet"}
        nlp_keywords = {"language", "nlp", "text", "translation", "bert", "gpt", "transformer", "squad", "attention"}

        is_cv = any(kw in text_lower for kw in cv_keywords) or any(e["text"].lower() in cv_keywords for e in entities)
        is_nlp = any(kw in text_lower for kw in nlp_keywords) or any(e["text"].lower() in nlp_keywords for e in entities)

        sub_cat = "Natural Language Processing"
        app_area = "Language Models"
        if is_cv and not is_nlp:
            sub_cat = "Computer Vision"
            app_area = "Image Recognition"
        elif is_cv and is_nlp:
            sub_cat = "Multimodal Deep Learning"
            app_area = "Visual Question Answering"

        extracted_kws = [e["text"] for e in entities if e["type"] in ("MODEL", "DATASET", "TASK", "FRAMEWORK")][:6]
        if not extracted_kws:
            extracted_kws = ["Transformer", "Attention", "NLP"]
        return {
            "category": "Artificial Intelligence",
            "subCategory": sub_cat,
            "domain": "Deep Learning",
            "applicationArea": app_area,
            "difficulty": "Advanced",
            "keywords": list(set(extracted_kws))
        }

    # Fallback: General Research
    extracted_kws = [e["text"] for e in entities if e["type"] in ("MODEL", "DATASET", "TASK")][:6]
    return {
        "category": "General Research",
        "subCategory": "Unclassified",
        "domain": "Scientific Computing",
        "applicationArea": "Academic Research",
        "difficulty": "Intermediate",
        "keywords": list(set(extracted_kws)) if extracted_kws else ["Research"]
    }

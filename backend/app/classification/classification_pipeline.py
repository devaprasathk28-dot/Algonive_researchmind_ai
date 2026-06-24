import logging
from app.classification.domain_classifier import classify_domain
from app.classification.category_classifier import classify_category
from app.classification.complexity_analyzer import analyze_complexity
from app.classification.confidence_engine import calculate_confidence
from app.entity_extraction.entity_pipeline import run_entity_pipeline

logger = logging.getLogger(__name__)

def run_classification_pipeline(text: str, entities: list = None) -> dict:
    """
    Orchestrate the full semantic and entity-guided classification pipeline.
    """
    if not text or not text.strip():
        return {
            "domain": "General Research",
            "category": "Unclassified",
            "subCategory": "Unknown",
            "researchType": "Theoretical Research",
            "applicationArea": "Unspecified",
            "complexity": "Intermediate",
            "confidence": 0.5,
            "explanation": []
        }

    # Extract entities if they were not passed
    if entities is None:
        entities = run_entity_pipeline(text)

    # 1. Classify Domain
    # Use prefix text (first 4000 chars) for fast and contextual semantic encoding
    prefix_text = text[:4000]
    domain_res = classify_domain(prefix_text)
    domain = domain_res["domain"]
    domain_conf = domain_res["confidence"]

    # 2. Classify Category within Domain
    category_res = classify_category(prefix_text, domain)
    category = category_res["category"]
    category_conf = category_res["confidence"]

    # 3. Analyze Complexity level
    complexity_res = analyze_complexity(text, entities)
    complexity = complexity_res["complexity"]

    # 4. Detect Research Type
    text_lower = text.lower()
    type_keywords = {
        "Survey Paper": ["survey", "review", "overview", "taxonomy", "state-of-the-art", "landscape"],
        "Benchmark Study": ["benchmark", "evaluation", "comparative study", "baseline", "comparison", "dataset"],
        "Experimental Research": ["experiment", "novel", "proposal", "method", "proposed method", "accuracy", "empirical"],
        "Applied Research": ["application", "applied", "case study", "deployed", "real-world", "system"],
        "Theoretical Research": ["theorem", "proof", "mathematical", "lemma", "proposition", "formalize"]
    }

    type_scores = {}
    for r_type, keywords in type_keywords.items():
        type_scores[r_type] = sum(1 for kw in keywords if kw in text_lower)

    best_type = max(type_scores, key=type_scores.get)
    if type_scores[best_type] == 0:
        best_type = "Experimental Research"

    # 5. Determine Subcategory & Application Area from scientific entities
    target_types = {"MODEL", "DATASET", "FRAMEWORK", "METHOD", "TASK"}
    scientific_entities = [e for e in entities if e.get("type", e.get("label", "")).upper() in target_types]

    # Map target entities to subcategory and application area
    nlp_entities = {"bert", "transformer", "gpt", "llama", "attention", "t5", "translation", "ner", "squad"}
    cv_entities = {"cnn", "resnet", "yolo", "vit", "coco", "imagenet", "segmentation", "detection"}

    has_nlp = any(e["text"].lower() in nlp_entities for e in scientific_entities)
    has_cv = any(e["text"].lower() in cv_entities for e in scientific_entities)

    application_area = "General AI Systems"
    subcategory = "Generic Systems"

    if has_nlp and not has_cv:
        application_area = "NLP Systems"
        subcategory = "Language Modeling"
    elif has_cv and not has_nlp:
        application_area = "Computer Vision"
        subcategory = "Object Detection"
    elif has_cv and has_nlp:
        application_area = "Multimodal Systems"
        subcategory = "Visual Question Answering"

    # If domain is not Artificial Intelligence, align subcategory to domain categories
    if domain != "Artificial Intelligence" and category != "Unclassified":
        subcategory = f"{category} Analysis"
        application_area = f"{domain} Application"

    # Refine application area & subcategory using detected entities
    if scientific_entities:
        top_ent = scientific_entities[0]["text"]
        if application_area == "General AI Systems":
            application_area = f"{top_ent} Application"
        if subcategory == "Generic Systems":
            subcategory = f"{top_ent} Analysis"

    # 6. Calculate Confidence Score
    entity_conf = min(len(scientific_entities) / 10.0, 1.0)
    confidence = calculate_confidence(domain_conf, category_conf, entity_conf)

    # 7. Formulate explanations list
    explanation = [e["text"] for e in scientific_entities[:6]]

    return {
        "domain": domain,
        "category": category,
        "subCategory": subcategory,
        "researchType": best_type,
        "applicationArea": application_area,
        "complexity": complexity,
        "confidence": confidence,
        "explanation": explanation
    }

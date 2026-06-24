from app.entity_extraction.scientific_entities import (
    MODELS, DATASETS, FRAMEWORKS, METHODS, METRICS, TASKS, ORGANIZATIONS
)

def classify_entity(entity: str) -> str:
    """
    Classify entity text into research-specific categories using dictionary lookup and keyword heuristic mappings.
    """
    text = entity.lower().strip()

    # 1. Check direct matches
    if text in [m.lower() for m in MODELS]:
        return "MODEL"
    if text in [d.lower() for d in DATASETS]:
        return "DATASET"
    if text in [f.lower() for f in FRAMEWORKS]:
        return "FRAMEWORK"
    if text in [m.lower() for m in METHODS]:
        return "METHOD"
    if text in [m.lower() for m in METRICS]:
        return "METRIC"
    if text in [t.lower() for t in TASKS]:
        return "TASK"
    if text in [o.lower() for o in ORGANIZATIONS]:
        return "ORGANIZATION"

    # 2. Check suffix / substring checks
    if any(keyword in text for keyword in ["model", "network", "transformer", "bert", "gpt", "llama", "resnet"]):
        return "MODEL"
    if any(keyword in text for keyword in ["dataset", "corpus", "bench", "imagenet", "squad", "coco"]):
        return "DATASET"
    if any(keyword in text for keyword in ["framework", "library", "pytorch", "tensorflow", "keras"]):
        return "FRAMEWORK"
    if any(keyword in text for keyword in ["method", "algorithm", "optimization", "descent", "attention"]):
        return "METHOD"
    if any(keyword in text for keyword in ["metric", "score", "accuracy", "bleu", "rouge", "loss", "perplexity"]):
        return "METRIC"
    if any(keyword in text for keyword in ["task", "classification", "generation", "summarization", "detection", "segmentation"]):
        return "TASK"
    if any(keyword in text for keyword in ["university", "institute", "lab", "google", "meta", "openai", "nvidia", "microsoft", "deepmind"]):
        return "ORGANIZATION"

    return "GENERAL"

from typing import List, Dict, Any

ACADEMIC_ENTITY_TYPES = {"MODEL", "DATASET", "FRAMEWORK", "METHOD", "TASK"}

def extract_target_entities(entities: List[Dict[str, Any]]) -> set:
    """
    Filter and clean a list of entities to extract unique academic category names.
    Accepts entities in both database format and schema format.
    """
    target_set = set()
    for e in entities:
        # Support database entity or pipeline output structure
        name = e.get("text", e.get("name", ""))
        label = e.get("type", e.get("label", e.get("entity_type", "")))
        if name and label and label.upper() in ACADEMIC_ENTITY_TYPES:
            target_set.add(name.lower().strip())
    return target_set

def calculate_entity_similarity(entities1: List[Dict[str, Any]], entities2: List[Dict[str, Any]]) -> float:
    """
    Compute Jaccard similarity over filtered academic entity sets.
    """
    set1 = extract_target_entities(entities1)
    set2 = extract_target_entities(entities2)

    if not set1 and not set2:
        return 0.0

    intersection = set1.intersection(set2)
    union = set1.union(set2)

    return len(intersection) / len(union) if len(union) > 0 else 0.0

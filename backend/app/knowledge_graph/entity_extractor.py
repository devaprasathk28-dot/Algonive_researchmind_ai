from app.entity_extraction.entity_pipeline import run_entity_pipeline

def extract_entities(text: str) -> list[dict]:
    if not text or not text.strip():
        return []

    pipeline_results = run_entity_pipeline(text)
    
    entities = []
    seen = set()
    for ent in pipeline_results:
        text_lower = ent["text"].lower().strip()
        if not text_lower or text_lower in seen:
            continue
        seen.add(text_lower)

        entities.append({
            "text": ent["text"],
            "label": ent["type"],
            "start": ent["start"],
            "end": ent["end"],
            "sentence_id": ent["sentence_id"]
        })

    return entities

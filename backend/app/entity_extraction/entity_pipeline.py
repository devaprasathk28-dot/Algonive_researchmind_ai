from app.entity_extraction.entity_extractor import extract_entities
from app.entity_extraction.entity_classifier import classify_entity
from app.database import models
from sqlalchemy.orm import Session
from collections import Counter

def run_entity_pipeline(text: str) -> list[dict]:
    """
    Run entity extraction and classification pipeline on raw text.
    """
    raw_entities = extract_entities(text)
    results = []
    for ent in raw_entities:
        results.append({
            "text": ent["text"],
            "type": classify_entity(ent["text"]),
            "start": ent["start"],
            "end": ent["end"],
            "sentence_id": ent["sentence_id"]
        })
    return results

def save_paper_entities(db: Session, paper_id: int, text: str):
    """
    Run pipeline on paper text, count entity frequencies, and store them in the entities table.
    """
    entities = run_entity_pipeline(text)
    if not entities:
        return

    # Count frequency of each entity name + type combination
    counts = Counter((e["text"], e["type"]) for e in entities)

    # Delete any existing entities for this paper to avoid duplication on re-parse
    db.query(models.Entity).filter(models.Entity.paper_id == paper_id).delete()

    # Save to database
    for (name, entity_type), frequency in counts.items():
        # Keep name within 255 chars limit
        db_entity = models.Entity(
            paper_id=paper_id,
            name=name[:255],
            entity_type=entity_type,
            frequency=frequency
        )
        db.add(db_entity)

    db.commit()

from app.classification.classification_pipeline import (
    run_classification_pipeline
)

def generate_classification(
    parsed_paper,
    db=None
):

    full_text = ""

    sections = parsed_paper.get("sections", {})
    if isinstance(sections, dict):
        for section in sections.values():
            full_text += str(section) + "\n"
    else:
        full_text += str(sections)

    if not full_text:
        full_text = parsed_paper.get("title", "") + " " + parsed_paper.get("abstract", "")

    # Retrieve or extract entities
    entities = []
    paper_id = parsed_paper.get("id")
    if paper_id and db:
        from app.database import models
        db_entities = db.query(models.Entity).filter(models.Entity.paper_id == int(paper_id)).all()
        if db_entities:
            entities = [{"text": e.name, "type": e.entity_type} for e in db_entities]

    if not entities and full_text:
        from app.entity_extraction.entity_pipeline import run_entity_pipeline
        entities = run_entity_pipeline(full_text)

    return run_classification_pipeline(
        full_text,
        entities=entities
    )

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database import models

from app.ai.classification.classification_pipeline import (
    generate_classification
)

router = APIRouter()

@router.post(
    "/classify-paper"
)
def classify_paper(
    parsed_paper: dict,
    db: Session = Depends(get_db)
):
    paper_id = parsed_paper.get("id")
    if paper_id:
        db_class = db.query(models.Classification).filter(models.Classification.paper_id == int(paper_id)).first()
        if db_class:
            db_entities = db.query(models.Entity).filter(models.Entity.paper_id == int(paper_id)).all()
            sci_types = {"MODEL", "DATASET", "FRAMEWORK", "METHOD", "METRIC", "TASK"}
            explanation = [e.name for e in db_entities if e.entity_type.upper() in sci_types]
            keywords = [e.name for e in db_entities if e.entity_type not in ("GENERAL", "ORGANIZATION")]
            return {
                "category": db_class.category,
                "subCategory": db_class.sub_category,
                "domain": db_class.domain,
                "applicationArea": db_class.industry_relevance,
                "difficulty": db_class.complexity,
                "researchType": db_class.research_type or "Experimental Research",
                "confidence": db_class.confidence or 0.85,
                "explanation": explanation,
                "keywords": keywords
            }

    result = generate_classification(
        parsed_paper,
        db=db
    )

    if paper_id:
        db_class = models.Classification(
            paper_id=int(paper_id),
            domain=result.get("domain"),
            category=result.get("category"),
            sub_category=result.get("subCategory"),
            complexity=result.get("complexity"),
            industry_relevance=result.get("applicationArea"),
            research_type=result.get("researchType"),
            confidence=result.get("confidence")
        )
        db.add(db_class)
        db.commit()
        db.refresh(db_class)

    result["keywords"] = result.get("explanation", [])
    return result

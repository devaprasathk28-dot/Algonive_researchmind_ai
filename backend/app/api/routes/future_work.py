from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database import models
import json

from app.ai.future_work.future_work_engine import (
    generate_future_work
)

from app.ai.future_work.improvement_generator import (
    generate_improvements
)

from app.ai.future_work.innovation_engine import (
    generate_innovative_ideas
)

from app.future_work.future_work_pipeline import (
    run_future_work_pipeline
)

router = APIRouter()

@router.post("/generate-future-work")
def generate_ai_future_work(payload: dict):

    text = payload["text"]

    future_work = generate_future_work(text)

    improvements = generate_improvements(text)

    innovations = generate_innovative_ideas(text)

    return {

        "future_work_suggestions":
            future_work,

        "improvement_recommendations":
            improvements,

        "innovation_opportunities":
            innovations
    }

@router.post("/future-work")
def future_work(
    parsed_paper: dict,
    db: Session = Depends(get_db)
):
    paper_id = parsed_paper.get("id")
    if paper_id:
        db_paper = db.query(models.ResearchPaper).filter(models.ResearchPaper.id == int(paper_id)).first()
        if db_paper and db_paper.future_work:
            try:
                return json.loads(db_paper.future_work)
            except Exception:
                pass

    result = run_future_work_pipeline(
        parsed_paper
    )

    if paper_id:
        db_paper = db.query(models.ResearchPaper).filter(models.ResearchPaper.id == int(paper_id)).first()
        if db_paper:
            db_paper.future_work = json.dumps(result)
            db.commit()
            db.refresh(db_paper)

    return result


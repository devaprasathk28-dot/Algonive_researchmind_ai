from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.crud import update_paper_summary
import json

from app.ai.summarizer.summarization_pipeline import (
    run_summarization_pipeline
)

router = APIRouter()

@router.post("/summarize-paper")
def summarize_paper(
    parsed_paper: dict,
    db: Session = Depends(get_db)
):
    paper_id = parsed_paper.get("id")
    if paper_id:
        from app.database import models
        db_paper = db.query(models.ResearchPaper).filter(models.ResearchPaper.id == int(paper_id)).first()
        if db_paper and db_paper.summary:
            try:
                return json.loads(db_paper.summary)
            except Exception:
                pass

    summary = (
        run_summarization_pipeline(
            parsed_paper
        )
    )

    # Save summary to database
    if paper_id:
        update_paper_summary(
            db,
            paper_id=int(paper_id),
            summary=json.dumps(summary)
        )

    return summary


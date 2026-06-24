from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database import models
from app.document_intelligence.metrics_pipeline import (
    run_metrics_pipeline
)

router = APIRouter()

@router.post("/project-metrics")
def project_metrics(
    parsed_paper: dict,
    db: Session = Depends(get_db)
):
    paper_id = parsed_paper.get("id")
    pdf_path = None

    if paper_id:
        paper = db.query(models.Paper).filter(models.Paper.id == int(paper_id)).first()
        if paper:
            pdf_path = paper.pdf_path or paper.file_path

    if not pdf_path:
        pdf_path = parsed_paper.get("pdf_path") or parsed_paper.get("file_path")

    result = run_metrics_pipeline(parsed_paper, pdf_path=pdf_path)

    if paper_id:
        db_analysis = db.query(models.Analysis).filter(models.Analysis.paper_id == int(paper_id)).first()
        if not db_analysis:
            db_analysis = models.Analysis(paper_id=int(paper_id))
            db.add(db_analysis)

        db_analysis.page_count = result["pages"]
        db_analysis.word_count = result["words"]
        db_analysis.reading_time = result["reading_time"]
        db_analysis.reference_count = result["references"]
        db_analysis.figure_count = result["figures"]
        db_analysis.table_count = result["tables"]
        db_analysis.equation_count = result["equations"]
        db_analysis.complexity_score = result["complexity_score"]
        db_analysis.technical_density = result["technical_density"]
        db_analysis.document_intelligence = result["document_intelligence"]
        db_analysis.research_health = result["research_health"]

        db_class = db.query(models.Classification).filter(models.Classification.paper_id == int(paper_id)).first()
        if db_class:
            db_class.complexity = result["complexity"]

        db.commit()

    return result

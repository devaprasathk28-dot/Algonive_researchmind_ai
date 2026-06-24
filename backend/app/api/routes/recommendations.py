from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import json

from app.database.connection import get_db
from app.database import models
from app.recommendation_engine.recommendation_service import generate_and_save_hybrid_recommendations

router = APIRouter()

@router.post("/recommendations")
def recommendations(
    parsed_paper: dict,
    db: Session = Depends(get_db)
):
    paper_id = parsed_paper.get("id")
    if paper_id:
        db_recs = db.query(models.Recommendation).filter(models.Recommendation.paper_id == int(paper_id)).all()
        if db_recs:
            try:
                similar_papers = []
                datasets = []
                models_list = []
                topics = []
                research_gaps = []
                
                for i, r in enumerate(db_recs):
                    # Attempt to re-hydrate metadata from Paper table if present
                    cand_paper = db.query(models.Paper).filter(models.Paper.title == r.recommended_paper).first()
                    authors = [a.strip() for a in cand_paper.authors.split(",")] if cand_paper and cand_paper.authors else []
                    abstract = cand_paper.abstract or cand_paper.summary or "" if cand_paper else ""
                    pdf_url = cand_paper.pdf_path if cand_paper else None

                    similar_papers.append({
                        "title": r.recommended_paper,
                        "authors": authors,
                        "abstract": abstract,
                        "pdf_url": pdf_url,
                        "arxiv_url": None, # arXiv links are calculated live if needed
                        "score": r.score,
                        "reason": json.loads(r.reason) if r.reason else [],
                        "related_models": [],
                        "related_datasets": []
                    })
                    
                    if i == 0:
                        datasets = json.loads(r.datasets) if r.datasets else []
                        models_list = json.loads(r.models) if r.models else []
                        topics = json.loads(r.topics) if r.topics else []
                        research_gaps = json.loads(r.research_gaps) if r.research_gaps else []

                return {
                    "datasets": datasets,
                    "models": models_list,
                    "topics": topics,
                    "research_gaps": research_gaps,
                    "similar_papers": similar_papers
                }
            except Exception:
                pass

    # Run the hybrid scoring recommendations generator pipeline
    result = generate_and_save_hybrid_recommendations(
        parsed_paper,
        db=db
    )
    return result

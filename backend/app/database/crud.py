from sqlalchemy.orm import Session
from app.database import models
import json

def get_paper(db: Session, paper_id: int):
    return db.query(models.ResearchPaper).filter(models.ResearchPaper.id == paper_id).first()

def get_paper_by_title(db: Session, title: str):
    return db.query(models.ResearchPaper).filter(models.ResearchPaper.title == title).first()

def get_papers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ResearchPaper).order_by(models.ResearchPaper.created_at.desc()).offset(skip).limit(limit).all()

from typing import Optional

def create_paper(db: Session, title: str, authors: str, abstract: str, full_text: str = "", summary: str = "", critique: str = "", user_id: Optional[int] = None, workspace_id: Optional[int] = None):
    db_paper = models.ResearchPaper(
        title=title,
        authors=authors,
        abstract=abstract,
        full_text=full_text,
        summary=summary,
        critique=critique,
        user_id=user_id,
        workspace_id=workspace_id
    )


    db.add(db_paper)
    db.commit()
    db.refresh(db_paper)
    return db_paper

def update_paper_summary(db: Session, paper_id: int, summary: str):
    db_paper = get_paper(db, paper_id)
    if db_paper:
        db_paper.summary = summary
        db.commit()
        db.refresh(db_paper)
    return db_paper

def update_paper_critique(db: Session, paper_id: int, critique: str):
    db_paper = get_paper(db, paper_id)
    if db_paper:
        db_paper.critique = critique
        db.commit()
        db.refresh(db_paper)
    return db_paper

def save_analysis(
    db: Session,
    paper_id: int,
    novelty: str,
    clarity: str,
    innovation: str,
    technical_depth: str,
    reproducibility: float = 7.5,
    dataset_quality: float = 8.0,
    research_health: float = 8.0,
    novelty_score: float = None,
    novelty_reason: str = None,
    clarity_score: float = None,
    clarity_reason: str = None,
    innovation_score: float = None,
    innovation_reason: str = None,
    technical_score: float = None,
    technical_reason: str = None,
    reproducibility_score: float = None,
    reproducibility_reason: str = None,
    dataset_quality_score: float = None,
    dataset_quality_reason: str = None,
    confidence_score: float = None
):
    db_analysis = db.query(models.PaperAnalysis).filter(models.PaperAnalysis.paper_id == paper_id).first()
    if db_analysis:
        db_analysis.novelty = novelty
        db_analysis.clarity = clarity
        db_analysis.innovation = innovation
        db_analysis.technical_depth = technical_depth
    else:
        db_analysis = models.PaperAnalysis(
            paper_id=paper_id,
            novelty=novelty,
            clarity=clarity,
            innovation=innovation,
            technical_depth=technical_depth
        )
        db.add(db_analysis)
        
    # Save to the new Analysis model
    db_analysis_new = db.query(models.Analysis).filter(models.Analysis.paper_id == paper_id).first()
    try:
        f_novelty = float(novelty)
        f_clarity = float(clarity)
        f_innovation = float(innovation)
        f_depth = float(technical_depth)
    except Exception:
        f_novelty = 0.0
        f_clarity = 0.0
        f_innovation = 0.0
        f_depth = 0.0

    if db_analysis_new:
        db_analysis_new.novelty = f_novelty
        db_analysis_new.clarity = f_clarity
        db_analysis_new.innovation = f_innovation
        db_analysis_new.technical_depth = f_depth
        db_analysis_new.reproducibility = reproducibility
        db_analysis_new.dataset_quality = dataset_quality
        db_analysis_new.research_health = research_health
        # Step 35 Columns
        db_analysis_new.novelty_score = novelty_score
        db_analysis_new.novelty_reason = novelty_reason
        db_analysis_new.clarity_score = clarity_score
        db_analysis_new.clarity_reason = clarity_reason
        db_analysis_new.innovation_score = innovation_score
        db_analysis_new.innovation_reason = innovation_reason
        db_analysis_new.technical_score = technical_score
        db_analysis_new.technical_reason = technical_reason
        db_analysis_new.reproducibility_score = reproducibility_score
        db_analysis_new.reproducibility_reason = reproducibility_reason
        db_analysis_new.dataset_quality_score = dataset_quality_score
        db_analysis_new.dataset_quality_reason = dataset_quality_reason
        db_analysis_new.confidence_score = confidence_score
    else:
        db_analysis_new = models.Analysis(
            paper_id=paper_id,
            novelty=f_novelty,
            clarity=f_clarity,
            innovation=f_innovation,
            technical_depth=f_depth,
            reproducibility=reproducibility,
            dataset_quality=dataset_quality,
            research_health=research_health,
            # Step 35 Columns
            novelty_score=novelty_score,
            novelty_reason=novelty_reason,
            clarity_score=clarity_score,
            clarity_reason=clarity_reason,
            innovation_score=innovation_score,
            innovation_reason=innovation_reason,
            technical_score=technical_score,
            technical_reason=technical_reason,
            reproducibility_score=reproducibility_score,
            reproducibility_reason=reproducibility_reason,
            dataset_quality_score=dataset_quality_score,
            dataset_quality_reason=dataset_quality_reason,
            confidence_score=confidence_score
        )
        db.add(db_analysis_new)

    db.commit()
    db.refresh(db_analysis)
    db.refresh(db_analysis_new)
    return db_analysis

def save_chat_message(db: Session, paper_id: int, question: str, answer: str, user_id: Optional[int] = None):
    db_chat = models.ChatHistory(
        paper_id=paper_id,
        question=question,
        answer=answer,
        user_id=user_id
    )

    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat

def get_chat_history(db: Session, paper_id: int):
    return db.query(models.ChatHistory).filter(models.ChatHistory.paper_id == paper_id).all()

def delete_paper(db: Session, paper_id: int):
    db_paper = get_paper(db, paper_id)
    if db_paper:
        db.delete(db_paper)
        db.commit()
        return True
    return False

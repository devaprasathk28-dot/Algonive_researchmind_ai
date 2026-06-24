from sqlalchemy.orm import Session
from typing import Optional
from app.database import models

def get_user_papers(db: Session, user_id: int, workspace_id: Optional[int] = None):
    query = db.query(models.ResearchPaper).filter(models.ResearchPaper.user_id == user_id)
    if workspace_id is not None:
        query = query.filter(models.ResearchPaper.workspace_id == workspace_id)
    return query.order_by(models.ResearchPaper.created_at.desc()).all()

def delete_paper(db: Session, paper_id: int) -> bool:
    paper = (
        db.query(models.ResearchPaper)
        .filter(models.ResearchPaper.id == paper_id)
        .first()
    )
    if not paper:
        return False
    db.delete(paper)
    db.commit()
    return True

def create_file_metadata(db: Session, paper_id: int, file_name: str, file_size: int):
    db_file = models.FileMetadata(
        paper_id=paper_id,
        file_name=file_name,
        file_size=file_size
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file

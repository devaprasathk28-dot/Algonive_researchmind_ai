from sqlalchemy.orm import Session
from app.library.library_crud import create_file_metadata
from app.database import models
import os

def register_uploaded_file(db: Session, paper_id: int, file_path: str, file_name: str):
    """
    Registers file metadata and updates the paper record with local paths.
    """
    file_size = 0
    if os.path.exists(file_path):
        try:
            file_size = os.path.getsize(file_path)
        except Exception:
            pass
            
    paper = db.query(models.ResearchPaper).filter(models.ResearchPaper.id == paper_id).first()
    if paper:
        paper.file_path = file_path
        paper.pdf_path = file_path
        paper.status = "completed"
        db.commit()
        db.refresh(paper)
        
    return create_file_metadata(
        db,
        paper_id=paper_id,
        file_name=file_name,
        file_size=file_size
    )

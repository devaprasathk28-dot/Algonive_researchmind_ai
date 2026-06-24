from sqlalchemy.orm import Session
from app.models.paper import Paper

def save_paper_analysis(
    db: Session,
    paper_data: dict
):
    """
    Save parsed paper analysis details to the database papers table.
    """
    paper = Paper(**paper_data)
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return paper

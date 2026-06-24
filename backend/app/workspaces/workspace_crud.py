from sqlalchemy.orm import Session
from app.database import models

def create_workspace(db: Session, user_id: int, name: str, description: str):
    workspace = models.Workspace(
        user_id=user_id,
        name=name,
        description=description
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return workspace

def get_workspaces(db: Session, user_id: int):
    return (
        db.query(models.Workspace)
        .filter(models.Workspace.user_id == user_id)
        .order_by(models.Workspace.created_at.desc())
        .all()
    )

def get_workspace(db: Session, workspace_id: int):
    return (
        db.query(models.Workspace)
        .filter(models.Workspace.id == workspace_id)
        .first()
    )

def delete_workspace(db: Session, workspace_id: int) -> bool:
    workspace = get_workspace(db, workspace_id)
    if not workspace:
        return False
        
    # Clean up local files for papers in this workspace first
    from app.library.file_manager import delete_local_files
    for paper in workspace.papers:
        delete_local_files(paper.file_path, paper.report_path)
        
    db.delete(workspace)
    db.commit()
    return True

def get_workspace_stats(db: Session, workspace_id: int):
    papers_count = (
        db.query(models.ResearchPaper)
        .filter(models.ResearchPaper.workspace_id == workspace_id)
        .count()
    )
    
    chats_count = (
        db.query(models.ChatHistory)
        .join(models.ResearchPaper)
        .filter(models.ResearchPaper.workspace_id == workspace_id)
        .count()
    )
    
    # Reports can be generated for any completed paper in this workspace
    reports_count = (
        db.query(models.ResearchPaper)
        .filter(models.ResearchPaper.workspace_id == workspace_id)
        .filter(models.ResearchPaper.status == "completed")
        .count()
    )
    
    # Graphs count - count of papers with abstracts or full text in the workspace
    graphs_count = papers_count
    
    return {
        "papers": papers_count,
        "chats": chats_count,
        "reports": reports_count,
        "graphs": graphs_count
    }

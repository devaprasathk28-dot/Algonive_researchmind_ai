from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.database.connection import get_db
from app.database import models

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats/{user_id}")
def get_dashboard_stats(
    user_id: int,
    workspace_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    # Total papers for this user
    papers_query = db.query(models.ResearchPaper).filter(models.ResearchPaper.user_id == user_id)
    if workspace_id is not None:
        papers_query = papers_query.filter(models.ResearchPaper.workspace_id == workspace_id)
    papers_count = papers_query.count()

    # Total chats
    chats_query = db.query(models.ChatHistory).filter(models.ChatHistory.user_id == user_id)
    if workspace_id is not None:
        chats_query = chats_query.join(models.ResearchPaper).filter(models.ResearchPaper.workspace_id == workspace_id)
    chats_count = chats_query.count()

    # Total reports
    reports_query = db.query(models.ResearchPaper).filter(
        models.ResearchPaper.user_id == user_id,
        models.ResearchPaper.status == "completed"
    )
    if workspace_id is not None:
        reports_query = reports_query.filter(models.ResearchPaper.workspace_id == workspace_id)
    reports_count = reports_query.count()

    # Total workspaces
    workspaces_count = db.query(models.Workspace).filter(models.Workspace.user_id == user_id).count()

    return {
        "papers": papers_count,
        "chats": chats_count,
        "reports": reports_count,
        "workspaces": workspaces_count
    }

@router.get("/recent/{user_id}")
def get_recent_activities(
    user_id: int,
    workspace_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    # Recent papers
    papers_query = db.query(models.ResearchPaper).filter(models.ResearchPaper.user_id == user_id)
    if workspace_id is not None:
        papers_query = papers_query.filter(models.ResearchPaper.workspace_id == workspace_id)
    recent_papers = papers_query.order_by(models.ResearchPaper.created_at.desc()).limit(5).all()

    # Recent chats
    chats_query = db.query(models.ChatHistory).filter(models.ChatHistory.user_id == user_id)
    if workspace_id is not None:
        chats_query = chats_query.join(models.ResearchPaper).filter(models.ResearchPaper.workspace_id == workspace_id)
    recent_chats = chats_query.order_by(models.ChatHistory.created_at.desc()).limit(5).all()

    return {
        "recent_papers": [
            {
                "id": p.id,
                "title": p.title,
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "status": p.status
            }
            for p in recent_papers
        ],
        "recent_chats": [
            {
                "id": c.id,
                "paper_id": c.paper_id,
                "question": c.question,
                "answer": c.answer[:100] + "..." if c.answer else "",
                "created_at": c.created_at.isoformat() if c.created_at else None
            }
            for c in recent_chats
        ]
    }

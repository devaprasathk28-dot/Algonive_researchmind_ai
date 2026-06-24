import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.database.dependencies import get_db
from app.database import models
from app.feed.feed_generator import get_user_profile_text, generate_user_feed
from app.feed.recommendation_ranker import rank_feed, detect_breakthroughs
from app.feed.digest_generator import generate_daily_digest
from app.feed.notification_service import trigger_sync_alerts

router = APIRouter(prefix="/feed", tags=["feed"])

class InterestRequest(BaseModel):
    user_id: int
    topic: str

class SavePaperRequest(BaseModel):
    user_id: int
    title: str
    authors: str
    abstract: str
    arxiv_url: Optional[str] = None
    pdf_url: Optional[str] = None
    workspace_id: Optional[int] = None

@router.post("/save-paper")
def save_paper_to_library(request: SavePaperRequest, db: Session = Depends(get_db)):
    """
    Saves an arXiv paper from the recommended feed directly into the user's library and workspace.
    """
    try:
        # Check if paper with this title already exists in user's library
        exists = db.query(models.ResearchPaper).filter(
            models.ResearchPaper.user_id == request.user_id,
            models.ResearchPaper.title == request.title
        ).first()
        
        if exists:
            return {"status": "exists", "message": "Paper already exists in library", "paper_id": exists.id}
            
        new_paper = models.ResearchPaper(
            user_id=request.user_id,
            workspace_id=request.workspace_id,
            title=request.title,
            authors=request.authors,
            abstract=request.abstract,
            file_path=request.pdf_url,
            status="completed",
            full_text=request.abstract,
            summary=json.dumps({"tldr": request.abstract[:200] + "...", "key_contributions": []}),
            critique=json.dumps({"strengths": [], "weaknesses": []})
        )
        db.add(new_paper)
        db.commit()
        db.refresh(new_paper)
        
        analysis = models.PaperAnalysis(
            paper_id=new_paper.id,
            novelty="8.0",
            clarity="8.0",
            innovation="8.0",
            technical_depth="8.0"
        )
        db.add(analysis)
        db.commit()
        
        return {"status": "success", "message": "Paper saved to library", "paper_id": new_paper.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save paper: {str(e)}"
        )


@router.get("/{user_id}")
def get_user_feed(user_id: int, db: Session = Depends(get_db)):
    """
    Returns the user's personalized research feed, including recommended papers,
    trending breakthrough alerts, and the daily text digest.
    """
    try:
        # Get user profile keywords from saved library papers
        profile_text = get_user_profile_text(db, user_id)
        
        # Get user's interests topics
        interests = db.query(models.UserInterest).filter(models.UserInterest.user_id == user_id).all()
        interests_list = [i.topic for i in interests]
        
        # Query arXiv for candidate research papers
        raw_papers = generate_user_feed(db, user_id)
        
        # Rank the papers using MiniLM sentence embeddings
        ranked_papers = rank_feed(profile_text, raw_papers, interests_list)
        
        # Identify breakthrough papers
        breakthroughs = detect_breakthroughs(ranked_papers)
        
        # Generate the daily digest
        daily_digest = generate_daily_digest(ranked_papers)
        
        # Trigger and log notifications for newly found highlights
        trigger_sync_alerts(db, user_id, ranked_papers)
        
        return {
            "feed": ranked_papers,
            "breakthroughs": breakthroughs,
            "daily_digest": daily_digest,
            "interests": interests_list
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate feed: {str(e)}"
        )

@router.get("/interests/{user_id}")
def get_interests(user_id: int, db: Session = Depends(get_db)):
    """
    Fetches all followed interest topics for the user.
    """
    interests = db.query(models.UserInterest).filter(models.UserInterest.user_id == user_id).all()
    return [i.topic for i in interests]

@router.post("/interests")
def add_interest(request: InterestRequest, db: Session = Depends(get_db)):
    """
    Adds a new interest topic for personalized search feeds.
    """
    # Check if interest already exists
    exists = db.query(models.UserInterest).filter(
        models.UserInterest.user_id == request.user_id,
        models.UserInterest.topic == request.topic
    ).first()
    
    if exists:
        return {"status": "exists", "message": "Interest already tracked"}
        
    try:
        new_interest = models.UserInterest(
            user_id=request.user_id,
            topic=request.topic
        )
        db.add(new_interest)
        db.commit()
        return {"status": "success", "message": f"Interest '{request.topic}' added."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add interest: {str(e)}"
        )

@router.delete("/interests/{user_id}/{topic}")
def remove_interest(user_id: int, topic: str, db: Session = Depends(get_db)):
    """
    Removes an interest topic.
    """
    interest = db.query(models.UserInterest).filter(
        models.UserInterest.user_id == user_id,
        models.UserInterest.topic == topic
    ).first()
    
    if not interest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interest not found"
        )
        
    try:
        db.delete(interest)
        db.commit()
        return {"status": "success", "message": f"Interest '{topic}' removed."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete interest: {str(e)}"
        )

@router.get("/notifications/{user_id}")
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieves the user's notification list ordered by newest first.
    """
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == user_id
    ).order_by(models.Notification.created_at.desc()).all()
    return notifications

@router.post("/notifications/read/{notification_id}")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    """
    Marks a single notification as read.
    """
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
        
    try:
        notification.is_read = True
        db.commit()
        return {"status": "success", "message": "Notification marked as read."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark notification as read: {str(e)}"
        )

@router.post("/notifications/read-all/{user_id}")
def mark_all_read(user_id: int, db: Session = Depends(get_db)):
    """
    Marks all notifications for a user as read.
    """
    try:
        db.query(models.Notification).filter(
            models.Notification.user_id == user_id
        ).update({models.Notification.is_read: True})
        db.commit()
        return {"status": "success", "message": "All notifications marked as read."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear notifications: {str(e)}"
        )

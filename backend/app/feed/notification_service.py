import logging
from sqlalchemy.orm import Session
from app.database.models import Notification
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

def create_notification(db: Session, user_id: int, title: str, message: str) -> Notification:
    """
    Creates and persists a user notification alert.
    """
    try:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            is_read=False
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating notification: {e}")
        return None

def trigger_sync_alerts(db: Session, user_id: int, papers: List[Dict[str, Any]]):
    """
    Scans the list of papers and generates smart notification alerts for breakthroughs
    or followed authors, limited to a maximum of 3 notifications per sync to avoid spam.
    """
    try:
        alert_count = 0
        max_alerts = 3
        
        for paper in papers:
            if alert_count >= max_alerts:
                break
                
            title = paper.get("title", "New Paper")
            # Limit title length in message
            short_title = title if len(title) < 80 else title[:77] + "..."
            
            # Case 1: Followed Author Paper
            source_reason = paper.get("source_reason", "")
            if "Author:" in source_reason:
                author = paper.get("source_author", "Followed Author")
                alert_title = f"New paper by {author}"
                alert_msg = f"'{short_title}' has been published. Read it now on ResearchMind AI."
                
                # Check if notification already exists to avoid duplication
                exists = db.query(Notification).filter(
                    Notification.user_id == user_id,
                    Notification.title == alert_title,
                    Notification.message == alert_msg
                ).first()
                
                if not exists:
                    create_notification(db, user_id, alert_title, alert_msg)
                    alert_count += 1
                    
            # Case 2: Breakthrough Paper
            elif paper.get("is_breakthrough", False) and alert_count < max_alerts:
                breakthrough_reason = paper.get("breakthrough_reason", "Contains agentic claims")
                alert_title = "Research Breakthrough Alert"
                alert_msg = f"SOTA / breakthrough paper detected: '{short_title}'. {breakthrough_reason}."
                
                exists = db.query(Notification).filter(
                    Notification.user_id == user_id,
                    Notification.title == alert_title,
                    Notification.message == alert_msg
                ).first()
                
                if not exists:
                    create_notification(db, user_id, alert_title, alert_msg)
                    alert_count += 1
                    
    except Exception as e:
        logger.error(f"Error triggering sync alerts: {e}")

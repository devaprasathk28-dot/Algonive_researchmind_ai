from typing import List
from sqlalchemy.orm import Session
from app.database import models
from app.recommendation_engine.interest_profiler import build_user_interest_profile

def get_user_interests(user_id: int, db: Session = None) -> List[str]:
    """
    Retrieve user interest profile from explicit FollowedTopics, UserInterests, and paper history.
    """
    interests = set()
    if not user_id or not db:
        return []

    try:
        # Retrieve explicit interests
        db_interests = db.query(models.UserInterest).filter(models.UserInterest.user_id == user_id).all()
        for item in db_interests:
            if item.topic:
                interests.add(item.topic.strip())

        # Retrieve followed topics
        db_topics = db.query(models.FollowedTopic).filter(models.FollowedTopic.user_id == user_id).all()
        for item in db_topics:
            if item.topic_name:
                interests.add(item.topic_name.strip())

        # Pull from uploaded paper history keywords if explicit list is sparse
        if len(interests) < 3:
            user_papers = db.query(models.Paper).filter(models.Paper.user_id == user_id).limit(10).all()
            for paper in user_papers:
                # Add title keywords
                words = [w.strip(",.()\"':").lower() for w in paper.title.split() if len(w) > 4]
                # Filter noise words
                stop_words = {"about", "their", "under", "using", "paper", "model", "analysis", "system", "method"}
                for w in words:
                    if w not in stop_words:
                        interests.add(w.capitalize())
    except Exception:
        pass

    return list(interests)

def calculate_interest_similarity(paper_text: str, paper_topics: List[str], user_interests: List[str]) -> float:
    """
    Calculate matching similarity score between a candidate paper and user interests.
    """
    if not user_interests:
        return 0.0

    paper_topics_lower = {t.lower().strip() for t in paper_topics if t}
    user_interests_lower = {i.lower().strip() for i in user_interests if i}

    # 1. Overlap of explicitly tagged topics (Jaccard)
    topic_match = 0.0
    if paper_topics_lower and user_interests_lower:
        intersection = paper_topics_lower.intersection(user_interests_lower)
        union = paper_topics_lower.union(user_interests_lower)
        topic_match = len(intersection) / len(union)

    # 2. Case-insensitive string search in title/abstract/text
    text_lower = paper_text.lower()
    matches = 0
    for interest in user_interests_lower:
        if interest in text_lower:
            matches += 1
    keyword_match = matches / len(user_interests_lower)

    # Combine: 60% text keyword containment and 40% explicit topic category Jaccard
    return float(0.6 * keyword_match + 0.4 * topic_match)

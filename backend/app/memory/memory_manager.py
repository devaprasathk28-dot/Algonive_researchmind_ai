from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from app.memory.vector_memory import store_memory, retrieve_similar_memories
from app.memory.episodic_memory import save_research_episode, get_recent_episodes
from app.memory.short_term_memory import get_short_term_context, add_recent_query
from app.memory.memory_retriever import retrieve_relevant_memories
from app.memory.memory_summarizer import generate_activity_summary
from app.database import models

def save_agent_memory(query: str, result: str):
    """
    Saves queries and episodes to short-term and vector stores.
    """
    memory_id = f"memory_{len(query)}"
    store_memory(memory_id, query)
    save_research_episode(query, result)
    add_recent_query(query)
    
    return {"memory_status": "saved"}

def retrieve_agent_memory(query: str):
    """
    Retrieve semantic and recent episodic memories.
    """
    semantic_memories = retrieve_similar_memories(query)
    recent_episodes = get_recent_episodes()
    short_term = get_short_term_context()
    
    return {
        "semantic_memories": semantic_memories,
        "recent_episodes": recent_episodes,
        "short_term_context": short_term
    }

def get_research_profile(db: Session, user_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Generates a persistent research profile for the user.
    """
    stats = generate_activity_summary(db, user_id)
    
    followed_topics = []
    followed_authors = []
    
    if user_id:
        topics = db.query(models.FollowedTopic).filter(models.FollowedTopic.user_id == user_id).all()
        authors = db.query(models.FollowedAuthor).filter(models.FollowedAuthor.user_id == user_id).all()
        followed_topics = [t.topic_name for t in topics]
        followed_authors = [a.author_name for a in authors]
        
    return {
        "user_id": user_id,
        "favorite_domains": stats["top_domains"],
        "top_models": stats["top_models"],
        "top_datasets": stats["top_datasets"],
        "top_methods": stats["top_methods"],
        "followed_topics": followed_topics,
        "followed_authors": followed_authors,
        "total_papers_analyzed": stats["total_papers"],
        "digest": stats["summary_markdown"]
    }

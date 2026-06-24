from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database.connection import get_db
from app.auth.dependencies import get_current_user_optional
from app.memory.long_term_memory import get_long_term_memories, clear_all_memories
from app.memory.memory_retriever import retrieve_relevant_memories
from app.memory.memory_manager import get_research_profile
from app.memory.knowledge_base import search_knowledge_base

router = APIRouter()

class MemoryResponse(BaseModel):
    id: int
    memory_type: str
    content: str
    created_at: datetime

    class Config:
        orm_mode = True

@router.get("/memory", response_model=List[MemoryResponse])
def list_memories(
    memory_type: Optional[str] = None, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user_optional)
):
    """
    Get list of long term memories.
    """
    user_id = current_user.id if current_user else None
    memories = get_long_term_memories(db, memory_type=memory_type, user_id=user_id)
    return memories

@router.get("/memory/search")
def search_memories(query: str, n_results: Optional[int] = 3):
    """
    Perform semantic vector search on ChromaDB.
    """
    if not query:
        raise HTTPException(status_code=400, detail="query parameter is required")
    results = retrieve_relevant_memories(query, n_results=n_results)
    return results

@router.get("/research-profile")
def research_profile(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user_optional)
):
    """
    Retrieve research activity metrics and interest profiles.
    """
    user_id = current_user.id if current_user else None
    profile = get_research_profile(db, user_id=user_id)
    return profile

@router.get("/knowledge-base")
def knowledge_base_search(query: str, db: Session = Depends(get_db)):
    """
    Perform unified keyword and semantic search.
    """
    results = search_knowledge_base(db, query)
    return results

@router.post("/memory/clear", status_code=status.HTTP_204_NO_CONTENT)
def clear_memories(db: Session = Depends(get_db)):
    """
    Clear SQLite research memory and ChromaDB collections.
    """
    clear_all_memories(db)
    return None

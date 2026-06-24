from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
from datetime import datetime

from app.models.research_memory import ResearchMemory
from app.memory.memory_embeddings import get_embedding
from app.memory.vector_memory import store_memory

def save_long_term_memory(db: Session, memory_type: str, content: str, user_id: Optional[int] = None) -> ResearchMemory:
    """
    Save memory to the relational database and the vector cache.
    """
    embedding_list = get_embedding(content)
    
    db_mem = ResearchMemory(
        user_id=user_id,
        memory_type=memory_type,
        content=content,
        embedding=json.dumps(embedding_list),
        created_at=datetime.utcnow()
    )
    db.add(db_mem)
    db.commit()
    db.refresh(db_mem)
    
    # Store in ChromaDB
    memory_id = f"mem_{db_mem.id}"
    store_memory(
        memory_id=memory_id,
        text=content,
        metadata={"memory_type": memory_type, "user_id": user_id or 0, "db_id": db_mem.id}
    )
    
    return db_mem

def get_long_term_memories(db: Session, memory_type: Optional[str] = None, user_id: Optional[int] = None) -> List[ResearchMemory]:
    """
    Retrieve memories from relational database.
    """
    query = db.query(ResearchMemory)
    if memory_type:
        query = query.filter(ResearchMemory.memory_type == memory_type)
    if user_id:
        query = query.filter(ResearchMemory.user_id == user_id)
        
    return query.order_by(ResearchMemory.created_at.desc()).all()

def clear_all_memories(db: Session):
    """
    Clears all memories from SQLite and ChromaDB.
    """
    db.query(ResearchMemory).delete()
    db.commit()
    
    try:
        from app.memory.vector_memory import client, collection
        client.delete_collection("research_memory")
        # Re-initialize collection reference
        import app.memory.vector_memory as vm
        vm.collection = client.create_collection("research_memory")
    except Exception as e:
        print("Failed to reset ChromaDB collection:", e)

from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.models.paper import Paper
from app.models.entity import Entity
from app.memory.memory_retriever import retrieve_relevant_memories

def search_knowledge_base(db: Session, query: str) -> Dict[str, Any]:
    """
    Search the unified research knowledge base.
    Merges matching papers, entities, and semantic memories.
    """
    if not query or not query.strip():
        return {"papers": [], "entities": [], "memories": []}
        
    query_clean = query.strip()
    
    # 1. Search papers matching title or abstract
    papers = db.query(Paper).filter(
        (Paper.title.like(f"%{query_clean}%")) | 
        (Paper.abstract.like(f"%{query_clean}%"))
    ).limit(10).all()
    
    papers_data = [
        {
            "id": p.id,
            "title": p.title,
            "authors": p.authors,
            "abstract": (p.abstract[:300] + "...") if p.abstract else ""
        }
        for p in papers
    ]
    
    # 2. Search entities matching name
    entities = db.query(Entity).filter(
        Entity.name.like(f"%{query_clean}%")
    ).limit(15).all()
    
    entities_data = [
        {
            "id": e.id,
            "name": e.name,
            "entity_type": e.entity_type,
            "paper_title": e.paper.title if e.paper else f"Paper #{e.paper_id}",
            "paper_id": e.paper_id
        }
        for e in entities
    ]
    
    # 3. Retrieve semantically similar memories from ChromaDB
    memories = retrieve_relevant_memories(query_clean, n_results=5)
    
    return {
        "query": query_clean,
        "papers": papers_data,
        "entities": entities_data,
        "memories": memories
    }

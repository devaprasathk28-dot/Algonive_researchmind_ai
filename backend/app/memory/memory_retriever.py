from typing import List, Dict, Any
from app.memory.vector_memory import retrieve_similar_memories

def retrieve_relevant_memories(query: str, n_results: int = 3) -> List[Dict[str, Any]]:
    """
    Search ChromaDB for relevant memories.
    """
    results = retrieve_similar_memories(query, n_results)
    
    if not results or not results.get("ids") or len(results["ids"][0]) == 0:
        return []
        
    formatted = []
    ids = results["ids"][0]
    documents = results["documents"][0]
    metadatas = results["metadatas"][0] if results.get("metadatas") else [None] * len(ids)
    distances = results["distances"][0] if results.get("distances") else [0.0] * len(ids)
    
    for i in range(len(ids)):
        meta = metadatas[i] or {}
        formatted.append({
            "id": ids[i],
            "content": documents[i],
            "memory_type": meta.get("memory_type", "OTHER"),
            "db_id": meta.get("db_id", None),
            "distance": round(distances[i], 3)
        })
        
    return formatted

def inject_memory_context(query: str) -> Dict[str, Any]:
    """
    RAG utility to inject context into prompts.
    """
    memories = retrieve_relevant_memories(query)
    return {
        "query": query,
        "memory_context": memories
    }

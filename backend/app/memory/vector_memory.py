import chromadb
from typing import List, Dict, Any
from app.memory.memory_embeddings import get_embedding

client = chromadb.PersistentClient(path="chroma_db")
collection = client.get_or_create_collection(name="research_memory")

def store_memory(memory_id: str, text: str, metadata: Dict[str, Any] = None):
    """
    Generate embedding and store memory in ChromaDB.
    """
    embedding = get_embedding(text)
    
    collection.add(
        ids=[memory_id],
        embeddings=[embedding],
        documents=[text],
        metadatas=[metadata] if metadata else None
    )
    
    return {"status": "memory_stored", "id": memory_id}

def retrieve_similar_memories(query: str, n_results: int = 3):
    """
    Query ChromaDB for similar memories.
    """
    query_embedding = get_embedding(query)
    
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    return results

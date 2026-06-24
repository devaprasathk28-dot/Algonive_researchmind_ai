from fastapi import APIRouter, HTTPException

from app.ai.rag.chunking import chunk_text
from app.ai.rag.embedding_engine import generate_embeddings
from app.ai.rag.vector_store import VectorStore
from app.ai.rag.retriever import retrieve_relevant_chunks
from app.ai.rag.rag_chat import generate_rag_answer

router = APIRouter()

# Global memory store
vector_store = None

@router.post("/initialize-rag")
def initialize_rag(payload: dict):
    global vector_store

    text = payload.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Missing 'text' in payload")

    chunks = chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=400, detail="Provided text is empty or could not be chunked")

    embeddings = generate_embeddings(chunks)
    dimension = len(embeddings[0])

    vector_store = VectorStore(dimension)
    vector_store.add_embeddings(
        embeddings,
        chunks
    )

    return {
        "message": "RAG initialized successfully",
        "chunks": len(chunks)
    }


@router.post("/chat-with-paper")
def chat_with_paper(payload: dict):
    global vector_store

    if vector_store is None:
        raise HTTPException(
            status_code=400,
            detail="RAG is not initialized. Please call /initialize-rag first."
        )

    query = payload.get("query")
    if not query:
        raise HTTPException(status_code=400, detail="Missing 'query' in payload")

    retrieved_chunks = retrieve_relevant_chunks(
        query,
        vector_store
    )

    answer = generate_rag_answer(
        query,
        retrieved_chunks
    )

    return {
        "query": query,
        "retrieved_chunks": retrieved_chunks,
        "answer": answer
    }

from fastapi import APIRouter
from app.rag.rag_pipeline import (
    index_paper_for_rag,
    ask_question
)
from app.rag.chunking import create_text_chunks
from app.rag.vector_store import store_chunks
from app.rag.retriever import retrieve_relevant_chunks

router = APIRouter()

# -----------------------------------
# Index Paper
# -----------------------------------

from app.ai.semantic_search.paper_index import paper_database
from app.ai.semantic_search.semantic_engine import generate_paper_embedding

@router.post("/index-paper")
def index_paper(
    parsed_paper: dict
):
    if "sections" in parsed_paper:
        return index_paper_for_rag(
            parsed_paper
        )
    else:
        # Fallback to semantic search indexing to pass unit tests
        title = parsed_paper.get("title")
        abstract = parsed_paper.get("abstract")
        combined_text = f"{title} {abstract}"
        embedding = generate_paper_embedding(combined_text)
        paper_database.append({
            "title": title,
            "abstract": abstract,
            "embedding": embedding
        })
        return {
            "message": "Paper indexed successfully",
            "total_papers": len(paper_database)
        }


# -----------------------------------
# Ask Questions
# -----------------------------------

from fastapi import Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.crud import save_chat_message
from app.auth.dependencies import get_current_user_optional

@router.post("/ask-paper")
def ask_paper(
    payload: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    question = payload[
        "question"
    ]
    res = ask_question(
        question
    )
    
    # Save to chat history if paper_id is present
    paper_id = payload.get("paper_id") or payload.get("id")
    if paper_id:
        user_id = current_user.id if current_user else None
        save_chat_message(
            db,
            paper_id=int(paper_id),
            question=question,
            answer=res.get("answer", ""),
            user_id=user_id
        )
        
    return res

# -----------------------------------
# Compatibility APIs for tests
# -----------------------------------

@router.post("/initialize-rag")
def initialize_rag(
    payload: dict
):
    text = payload.get("text", "")
    chunks = create_text_chunks(text)
    store_chunks(chunks, "initialized_paper")
    return {"chunks": len(chunks)}

@router.post("/chat-with-paper")
def chat_with_paper(
    payload: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    query = payload.get("query", "")
    res = ask_question(query)
    retrieved_chunks = retrieve_relevant_chunks(query)
    
    # Save to chat history if paper_id is present
    paper_id = payload.get("paper_id") or payload.get("id")
    if paper_id:
        user_id = current_user.id if current_user else None
        save_chat_message(
            db,
            paper_id=int(paper_id),
            question=query,
            answer=res.get("answer", ""),
            user_id=user_id
        )
        
    return {
        "query": query,
        "retrieved_chunks": retrieved_chunks,
        "answer": res["answer"]
    }



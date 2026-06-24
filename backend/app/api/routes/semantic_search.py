from fastapi import APIRouter, HTTPException

from app.ai.semantic_search.paper_index import (
    paper_database
)

from app.ai.semantic_search.semantic_engine import (
    generate_paper_embedding
)

from app.ai.semantic_search.similarity_search import (
    find_similar_papers
)

router = APIRouter()

@router.post("/index-paper")
def index_paper(payload: dict):

    title = payload.get("title")
    abstract = payload.get("abstract")

    if not title or not abstract:
        raise HTTPException(
            status_code=400,
            detail="Missing 'title' or 'abstract' in payload"
        )

    combined_text = f"{title} {abstract}"

    embedding = generate_paper_embedding(
        combined_text
    )

    paper_database.append({
        "title": title,
        "abstract": abstract,
        "embedding": embedding
    })

    return {
        "message": "Paper indexed successfully",
        "total_papers": len(paper_database)
    }


@router.post("/semantic-search")
def semantic_search(payload: dict):

    query = payload.get("query")
    if not query:
        raise HTTPException(
            status_code=400,
            detail="Missing 'query' in payload"
        )

    results = find_similar_papers(query)

    return {
        "query": query,
        "results": results
    }

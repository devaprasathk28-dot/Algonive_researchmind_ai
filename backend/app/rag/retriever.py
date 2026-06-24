from app.rag.vector_store import (
    collection
)

def retrieve_relevant_chunks(
    query,
    top_k=3
):
    results = collection.query(
        query_texts=[query],
        n_results=top_k
    )
    return results[
        "documents"
    ][0]

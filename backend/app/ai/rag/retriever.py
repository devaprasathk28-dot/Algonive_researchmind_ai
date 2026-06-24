from app.ai.rag.embedding_engine import generate_embeddings

def retrieve_relevant_chunks(query, vector_store):
    """
    Encode the query and retrieve relevant chunks from the vector store.
    """
    query_embedding = generate_embeddings([query])[0]
    results = vector_store.search(query_embedding)
    return results

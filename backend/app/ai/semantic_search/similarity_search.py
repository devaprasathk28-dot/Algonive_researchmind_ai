import numpy as np

from app.ai.semantic_search.paper_index import (
    paper_database
)

from app.ai.semantic_search.semantic_engine import (
    generate_paper_embedding
)

def cosine_similarity(a, b):

    return np.dot(a, b) / (
        np.linalg.norm(a) * np.linalg.norm(b)
    )

def find_similar_papers(query, top_k=5):

    query_embedding = generate_paper_embedding(query)

    similarities = []

    for paper in paper_database:

        similarity = cosine_similarity(
            query_embedding,
            paper["embedding"]
        )

        similarities.append({
            "title": paper["title"],
            "abstract": paper["abstract"],
            "similarity_score": float(similarity)
        })

    similarities = sorted(
        similarities,
        key=lambda x: x["similarity_score"],
        reverse=True
    )

    return similarities[:top_k]

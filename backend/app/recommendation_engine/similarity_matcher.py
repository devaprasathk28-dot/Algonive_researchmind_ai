from sklearn.metrics.pairwise import (
    cosine_similarity
)

from app.recommendation_engine.embedding_engine import (
    generate_embedding
)

def find_similar_papers(
    user_query,
    papers
):

    user_embedding = (
        generate_embedding(
            user_query
        ).reshape(1, -1)
    )

    similarities = []

    for paper in papers:

        paper_embedding = (
            generate_embedding(
                paper["title"]
            ).reshape(1, -1)
        )

        score = cosine_similarity(

            user_embedding,

            paper_embedding
        )[0][0]

        similarities.append({

            "paper":
                paper,

            "similarity_score":
                float(score)
        })

    return similarities

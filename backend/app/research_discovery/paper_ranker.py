from sklearn.metrics.pairwise import cosine_similarity
from app.recommendation_engine.embedding_engine import generate_embedding

def rank_papers(query: str, papers: list):
    if not papers:
        return []
        
    query_embedding = generate_embedding(query).reshape(1, -1)
    
    ranked = []
    for paper in papers:
        paper_text = paper.get("summary") or paper.get("title") or ""
        paper_embedding = generate_embedding(paper_text).reshape(1, -1)
        
        score = cosine_similarity(query_embedding, paper_embedding)[0][0]
        paper["similarity"] = float(score)
        ranked.append(paper)
        
    ranked.sort(key=lambda x: x["similarity"], reverse=True)
    return ranked

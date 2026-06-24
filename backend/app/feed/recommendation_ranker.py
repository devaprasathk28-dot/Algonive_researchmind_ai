import numpy as np
import logging
from typing import List, Dict, Any
from app.recommendation_engine.embedding_engine import model

logger = logging.getLogger(__name__)

def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    dot_product = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return float(dot_product / (norm_v1 * norm_v2))

def rank_feed(profile_text: str, papers: List[Dict[str, Any]], interests: List[str]) -> List[Dict[str, Any]]:
    """
    Ranks the list of papers based on similarity to the user's profile text.
    Adds a match score and a 'why_recommended' explanation to each paper.
    """
    if not papers:
        return []

    try:
        # Generate profile embedding
        profile_emb = model.encode(profile_text)
        
        ranked_papers = []
        for paper in papers:
            title = paper.get("title", "")
            summary = paper.get("summary", "")
            text_to_embed = f"{title} {summary}"
            
            paper_emb = model.encode(text_to_embed)
            sim = cosine_similarity(profile_emb, paper_emb)
            
            # Map similarity to a percentage between 0 and 100
            score = max(0, min(100, int(sim * 100)))
            
            # Formulate 'why_recommended' rationale
            why_recommended = ""
            source_reason = paper.get("source_reason", "")
            
            if "Author:" in source_reason:
                author = paper.get("source_author", "Followed Author")
                why_recommended = f"Published by followed author: {author}"
            elif "Topic:" in source_reason:
                topic = paper.get("source_topic", "")
                why_recommended = f"Matches your followed topic: {topic}"
            else:
                # Find if any keyword matches user interests
                matched_interest = None
                for interest in interests:
                    if interest.lower() in title.lower() or interest.lower() in summary.lower():
                        matched_interest = interest
                        break
                if matched_interest:
                    why_recommended = f"Highly relevant to your interest in '{matched_interest}'"
                elif score > 60:
                    why_recommended = f"Strong alignment ({score}% match) with papers in your library"
                else:
                    why_recommended = "Recommended based on trending research in machine learning"

            # Create a copy or update fields
            p_copy = dict(paper)
            p_copy["match_score"] = score
            p_copy["why_recommended"] = why_recommended
            ranked_papers.append(p_copy)
            
        # Sort by match score descending
        ranked_papers.sort(key=lambda x: x["match_score"], reverse=True)
        return ranked_papers
    except Exception as e:
        logger.error(f"Error ranking user feed: {e}")
        # Return original papers with fallback scores
        return [{**p, "match_score": 50, "why_recommended": "Recommended based on trending research"} for p in papers]

def detect_breakthroughs(papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Highlights and returns papers containing SOTA claims or agentic keywords.
    """
    breakthrough_keywords = [
        "state-of-the-art", "sota", "outperforms", "breakthrough", 
        "novel architecture", "superior performance", "we introduce", 
        "agentic", "autonomous agent", "multi-agent", "gpt-4", 
        "llm agent", "milestone", "revolutionize", "unprecedented"
    ]
    
    breakthrough_papers = []
    for paper in papers:
        title = paper.get("title", "").lower()
        summary = paper.get("summary", "").lower()
        
        is_breakthrough = False
        matched_kw = []
        for kw in breakthrough_keywords:
            if kw in title or kw in summary:
                is_breakthrough = True
                matched_kw.append(kw)
                
        if is_breakthrough:
            paper["is_breakthrough"] = True
            paper["breakthrough_reason"] = f"Breakthrough keyword detected: {', '.join(matched_kw[:2])}"
            breakthrough_papers.append(paper)
            
    return breakthrough_papers

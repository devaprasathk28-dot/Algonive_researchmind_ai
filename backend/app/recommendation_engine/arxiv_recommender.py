import logging
from typing import List, Dict, Any
from app.research_discovery.arxiv_service import search_papers

logger = logging.getLogger(__name__)

def build_arxiv_query(title: str, text: str, entities: List[Dict[str, Any]]) -> str:
    """
    Synthesize an search query string for arXiv by joining key entities and models.
    """
    # Filter target labels
    target_labels = {"MODEL", "DATASET", "METHOD", "TASK"}
    keywords = []

    for e in entities:
        name = e.get("text", e.get("name", ""))
        label = e.get("type", e.get("label", e.get("entity_type", "")))
        if name and label and label.upper() in target_labels:
            keywords.append(name.strip())

    # Keep unique keywords preserving order
    seen = set()
    unique_keywords = []
    for k in keywords:
        k_low = k.lower()
        if k_low not in seen and len(k) > 2:
            seen.add(k_low)
            unique_keywords.append(k)

    # Take top 3 keywords
    top_keywords = unique_keywords[:3]

    if not top_keywords:
        # Fallback to important words from title
        words = [w.strip(",.()\"':") for w in title.split() if len(w) > 4]
        stop_words = {"about", "their", "under", "using", "paper", "model", "analysis", "system", "method"}
        title_keywords = [w for w in words if w.lower() not in stop_words]
        top_keywords = title_keywords[:3]

    if not top_keywords:
        # Final fallback
        return "artificial intelligence"

    # Join keywords
    return " ".join(top_keywords)

def recommend_from_arxiv(title: str, text: str, entities: List[Dict[str, Any]], max_results: int = 10) -> List[Dict[str, Any]]:
    """
    Formulate an arXiv search query from paper content and fetch related papers.
    """
    query = build_arxiv_query(title, text, entities)
    logger.info(f"Synthesized arXiv recommendation query: '{query}'")
    try:
        results = search_papers(query, max_results=max_results)
        return results
    except Exception as e:
        logger.error(f"Error fetching arXiv recommendations: {e}")
        return []

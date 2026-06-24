from app.recommendation_engine.dataset_recommender import (
    recommend_datasets
)

from app.recommendation_engine.model_recommender import (
    recommend_models
)

from app.recommendation_engine.gap_detector import (
    detect_research_gaps
)

from app.recommendation_engine.topic_recommender import (
    recommend_topics
)

from app.recommendation_engine.paper_recommender import (
    recommend_papers
)

from app.core.cache import cache
import hashlib

def generate_recommendations(
    parsed_paper,
    db=None
):
    title = parsed_paper.get("title", "")
    abstract = parsed_paper.get("abstract", "") or ""
    cache_key = None
    if title or abstract:
        paper_hash = hashlib.md5(f"{title}:{abstract}".encode('utf-8')).hexdigest()
        cache_key = f"rec:paper:{paper_hash}"
        cached_res = cache.get(cache_key)
        if cached_res is not None:
            return cached_res

    text = ""

    # Extract text from sections safely
    sections = parsed_paper.get("sections", {})
    if isinstance(sections, dict):
        for section in sections.values():
            if isinstance(section, str):
                text += section + " "
    elif isinstance(sections, list):
        for section in sections:
            if isinstance(section, str):
                text += section + " "
            elif isinstance(section, dict):
                text += section.get("content", "") + " "

    # Fallback if no sections
    if not text.strip():
        text = parsed_paper.get("abstract", "") or parsed_paper.get("title", "") or ""

    # Setup query for similar paper recommendation
    query_text = parsed_paper.get("title", "")
    if abstract:
        query_text += " " + abstract
    if not query_text.strip():
        query_text = text[:500]

    paper_id = parsed_paper.get("id")

    # Retrieve or extract entities for the query paper
    query_entities = []
    if paper_id and db:
        from app.database import models
        db_entities = db.query(models.Entity).filter(models.Entity.paper_id == int(paper_id)).all()
        if db_entities:
            query_entities = [{"text": e.name, "type": e.entity_type} for e in db_entities]

    if not query_entities and text:
        from app.entity_extraction.entity_pipeline import run_entity_pipeline
        query_entities = run_entity_pipeline(text)

    similar_papers_results = recommend_papers(
        query_text=query_text,
        query_entities=query_entities,
        db=db,
        current_paper_id=int(paper_id) if paper_id else None
    )
    similar_papers = [p["title"] for p in similar_papers_results]

    res = {
        "datasets": recommend_datasets(text, entities=query_entities),
        "models": recommend_models(text, entities=query_entities),
        "topics": recommend_topics(text),
        "research_gaps": detect_research_gaps(text),
        "similar_papers": similar_papers
    }
    if cache_key:
        cache.set(cache_key, res, expire_seconds=3600)
    return res

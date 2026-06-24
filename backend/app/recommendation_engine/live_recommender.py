import json
import hashlib
import logging
from app.core.cache import cache
from app.realtime_research.arxiv_fetcher import fetch_latest_papers
from app.recommendation_engine.user_interest_engine import build_user_interest_profile
from app.recommendation_engine.embedding_similarity import get_or_create_embedding, calculate_embedding_similarity
from app.recommendation_engine.entity_similarity import calculate_entity_similarity
from app.recommendation_engine.user_interest_engine import calculate_interest_similarity
from app.recommendation_engine.recommendation_ranker import calculate_hybrid_score
from app.recommendation_engine.topic_recommender import recommend_topics

logger = logging.getLogger(__name__)

def execute_live_recommendation(research_history: list) -> dict:
    """
    Generate personalized feed recommendations for the user based on history.
    """
    try:
        history_str = json.dumps(research_history, sort_keys=True)
        history_hash = hashlib.md5(history_str.encode('utf-8')).hexdigest()
        cache_key = f"rec:live:{history_hash}"
        cached_res = cache.get(cache_key)
        if cached_res is not None:
            return cached_res
    except Exception:
        cache_key = None

    # 1. Build User Interests
    interests = build_user_interest_profile(research_history)
    if not interests:
        interests = ["Artificial Intelligence"]

    # 2. Fetch Latest Papers from arXiv on user interests
    query_topic = interests[0] if interests else "Artificial Intelligence"
    try:
        arxiv_candidates = fetch_latest_papers(query_topic, max_results=12)
    except Exception as e:
        logger.error(f"Error fetching live papers: {e}")
        arxiv_candidates = []

    # 3. Build a query vector representation of the user interest profile
    query_text = " ".join(interests)
    query_emb = get_or_create_embedding(0, query_text, None)
    
    from app.entity_extraction.entity_pipeline import run_entity_pipeline
    query_entities = run_entity_pipeline(query_text)

    # 4. Score each candidate
    scored_feed = []
    for cand in arxiv_candidates:
        title = cand.get("title", "")
        summary = cand.get("summary", "")
        cand_text = (title + " " + summary).strip()

        # Embedding similarity
        cand_emb = get_or_create_embedding(0, cand_text, None)
        emb_sim = calculate_embedding_similarity(query_emb, cand_emb)

        # Entity similarity
        cand_entities = run_entity_pipeline(cand_text)
        ent_sim = calculate_entity_similarity(query_entities, cand_entities)

        # User interest similarity
        cand_topics = recommend_topics(cand_text)
        itr_sim = calculate_interest_similarity(cand_text, cand_topics, interests)

        # Graph similarity is 0.0 for raw external feed papers
        grp_sim = 0.0

        hybrid_score = calculate_hybrid_score(emb_sim, ent_sim, grp_sim, itr_sim)

        scored_feed.append({
            "recommended_paper": title,
            "authors": cand.get("authors", []),
            "summary": summary,
            "published_date": cand.get("published", cand.get("published_date", "")),
            "similarity_score": round(hybrid_score, 3),
            "pdf_link": cand.get("pdf_url", cand.get("pdf_link", ""))
        })

    # Sort descending and take top 10
    scored_feed.sort(key=lambda x: x["similarity_score"], reverse=True)
    feed = scored_feed[:10]

    res = {
        "detected_interests": interests,
        "personalized_feed": feed
    }

    if cache_key:
        try:
            cache.set(cache_key, res, expire_seconds=3600)
        except Exception:
            pass

    return res

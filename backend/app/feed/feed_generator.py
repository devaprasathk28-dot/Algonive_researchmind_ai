import logging
from sqlalchemy.orm import Session
from app.database.models import ResearchPaper, UserInterest, FollowedTopic, FollowedAuthor
from app.research_discovery.arxiv_service import search_papers, search_by_author

logger = logging.getLogger(__name__)

def get_user_profile_text(db: Session, user_id: int) -> str:
    """
    Compiles titles, abstracts, and summaries of papers in the user's library
    to construct a personalization profile text.
    """
    try:
        papers = db.query(ResearchPaper).filter(ResearchPaper.user_id == user_id).all()
        if not papers:
            # Fallback to followed topics or interests if user library is empty
            interests = db.query(UserInterest).filter(UserInterest.user_id == user_id).all()
            topics = db.query(FollowedTopic).filter(FollowedTopic.user_id == user_id).all()
            fallback_terms = [i.topic for i in interests] + [t.topic_name for t in topics]
            if fallback_terms:
                return " ".join(fallback_terms)
            return "machine learning deep learning artificial intelligence"
        
        profile_parts = []
        for paper in papers:
            if paper.title:
                profile_parts.append(paper.title)
            if paper.abstract:
                profile_parts.append(paper.abstract)
            if paper.summary:
                profile_parts.append(paper.summary)
        
        return " ".join(profile_parts)
    except Exception as e:
        logger.error(f"Error compiling user profile text: {e}")
        return "machine learning deep learning artificial intelligence"

def generate_user_feed(db: Session, user_id: int):
    """
    Queries arXiv for papers matching the user's interests, followed topics, and followed authors.
    Deduplicates results and returns a list of candidate papers.
    """
    try:
        # 1. Fetch user interests, topics, and authors
        interests = db.query(UserInterest).filter(UserInterest.user_id == user_id).all()
        topics = db.query(FollowedTopic).filter(FollowedTopic.user_id == user_id).all()
        authors = db.query(FollowedAuthor).filter(FollowedAuthor.user_id == user_id).all()

        query_topics = [i.topic for i in interests] + [t.topic_name for t in topics]
        followed_author_names = [a.author_name for a in authors]

        raw_papers = []

        # 2. Search arXiv by author
        for author in followed_author_names:
            try:
                author_papers = search_by_author(author, max_results=5)
                for p in author_papers:
                    # Tag metadata for ranking
                    p["source_reason"] = f"Author: {author}"
                    p["source_author"] = author
                    raw_papers.append(p)
            except Exception as e:
                logger.error(f"Error searching arXiv for author {author}: {e}")

        # 3. Search arXiv by topic
        # If user has no topics, use some default trending topics
        if not query_topics:
            query_topics = ["Large Language Models", "Reinforcement Learning"]

        for topic in query_topics:
            try:
                topic_papers = search_papers(topic, max_results=5)
                for p in topic_papers:
                    p["source_reason"] = f"Topic: {topic}"
                    p["source_topic"] = topic
                    raw_papers.append(p)
            except Exception as e:
                logger.error(f"Error searching arXiv for topic {topic}: {e}")

        # 4. Deduplicate papers by title or arxiv_url
        seen_urls = set()
        deduplicated_papers = []
        for paper in raw_papers:
            url = paper.get("arxiv_url") or paper.get("pdf_url") or paper.get("title")
            if url not in seen_urls:
                seen_urls.add(url)
                deduplicated_papers.append(paper)

        return deduplicated_papers
    except Exception as e:
        logger.error(f"Error generating user feed: {e}")
        return []

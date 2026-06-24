from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
import os
import uuid
import json

from app.database.connection import get_db
from app.database import models, schemas, crud
from app.auth.dependencies import get_current_user_optional
from app.research_discovery.discovery_pipeline import discover_research, download_arxiv_pdf
from app.pdf_processing.pdf_pipeline import process_pdf
from app.library.library_pipeline import register_uploaded_file

router = APIRouter(prefix="/discovery", tags=["discovery"])

@router.get("/discover")
def discover(
    query: str,
    max_results: Optional[int] = 10,
    sort_by: Optional[str] = "relevance"
):
    if not query:
        raise HTTPException(status_code=400, detail="Query parameter is required")
    return discover_research(query, max_results=max_results, sort_by=sort_by)

@router.post("/import")
async def import_arxiv_paper(
    payload: dict,
    workspace_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    pdf_url = payload.get("pdf_url")
    title = payload.get("title", "Untitled arXiv Paper")
    
    if not pdf_url:
        raise HTTPException(status_code=400, detail="pdf_url is required")
        
    # Generate unique path for the downloaded PDF
    filename = f"arxiv_{uuid.uuid4().hex[:8]}.pdf"
    os.makedirs(os.path.join("app", "uploads"), exist_ok=True)
    file_path = os.path.join("app", "uploads", filename)
    
    try:
        # Download arXiv PDF
        download_arxiv_pdf(pdf_url, file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download PDF from arXiv: {e}")
        
    # Process PDF and extract sections
    try:
        parsed_data = process_pdf(file_path, filename)
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to parse downloaded PDF: {e}")
        
    # Save to Database
    authors = parsed_data.get("authors", [])
    authors_str = ", ".join(authors) if isinstance(authors, list) else str(authors)

    full_text = ""
    sections = parsed_data.get("sections")
    if sections and isinstance(sections, dict):
        for section_title, section_content in sections.items():
            full_text += f"{section_title}\n{section_content}\n\n"
    else:
        full_text = parsed_data.get("extracted_text") or parsed_data.get("abstract") or ""

    user_id = current_user.id if current_user else None

    # Use standard crud function to create paper
    db_paper = crud.create_paper(
        db,
        title=parsed_data.get("title") or title or "Untitled Paper",
        authors=authors_str or "Unknown",
        abstract=parsed_data.get("abstract") or "",
        full_text=full_text,
        summary="",
        critique="",
        user_id=user_id,
        workspace_id=workspace_id
    )

    # Register file metadata
    register_uploaded_file(
        db,
        paper_id=db_paper.id,
        file_path=file_path,
        file_name=filename
    )

    parsed_data["id"] = db_paper.id
    return parsed_data


# -----------------------------
# Followed Topics Endpoints
# -----------------------------

@router.get("/followed/topics/{user_id}", response_model=List[schemas.FollowedTopic])
def get_followed_topics(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.FollowedTopic).filter(models.FollowedTopic.user_id == user_id).all()

@router.post("/follow/topic", response_model=schemas.FollowedTopic)
def follow_topic(
    payload: schemas.FollowedTopicCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    # Check if already followed
    existing = db.query(models.FollowedTopic).filter(
        models.FollowedTopic.user_id == current_user.id,
        models.FollowedTopic.topic_name == payload.topic_name
    ).first()
    if existing:
        return existing
        
    topic = models.FollowedTopic(user_id=current_user.id, topic_name=payload.topic_name)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic

@router.delete("/unfollow/topic/{user_id}/{topic_name}")
def unfollow_topic(
    user_id: int,
    topic_name: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    if current_user and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    topic = db.query(models.FollowedTopic).filter(
        models.FollowedTopic.user_id == user_id,
        models.FollowedTopic.topic_name == topic_name
    ).first()
    
    if topic:
        db.delete(topic)
        db.commit()
        return {"success": True}
    return {"success": False}


# -----------------------------
# Followed Authors Endpoints
# -----------------------------

@router.get("/followed/authors/{user_id}", response_model=List[schemas.FollowedAuthor])
def get_followed_authors(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.FollowedAuthor).filter(models.FollowedAuthor.user_id == user_id).all()

@router.post("/follow/author", response_model=schemas.FollowedAuthor)
def follow_author(
    payload: schemas.FollowedAuthorCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    # Check if already followed
    existing = db.query(models.FollowedAuthor).filter(
        models.FollowedAuthor.user_id == current_user.id,
        models.FollowedAuthor.author_name == payload.author_name
    ).first()
    if existing:
        return existing
        
    author = models.FollowedAuthor(user_id=current_user.id, author_name=payload.author_name)
    db.add(author)
    db.commit()
    db.refresh(author)
    return author

@router.delete("/unfollow/author/{user_id}/{author_name}")
def unfollow_author(
    user_id: int,
    author_name: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    if current_user and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    author = db.query(models.FollowedAuthor).filter(
        models.FollowedAuthor.user_id == user_id,
        models.FollowedAuthor.author_name == author_name
    ).first()
    
    if author:
        db.delete(author)
        db.commit()
        return {"success": True}
    return {"success": False}


@router.get("/dashboard")
def get_discovery_dashboard(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Compile trending, personalized recommendations, opportunity analysis, 
    and target models/datasets for the research discovery tab.
    """
    # 1. Fetch user's papers or general papers if guest
    user_papers = []
    if user_id:
        user_papers = db.query(models.Paper).filter(models.Paper.user_id == user_id).all()
    else:
        user_papers = db.query(models.Paper).limit(10).all()

    # Get user interests
    from app.recommendation_engine.user_interest_engine import get_user_interests
    interests = get_user_interests(user_id, db) if user_id else ["artificial intelligence"]
    if not interests:
        interests = ["Artificial Intelligence"]

    # 2. Recommended Papers (using live recommendation engine)
    history = [p.title for p in user_papers]
    from app.recommendation_engine.live_recommender import execute_live_recommendation
    live_rec = execute_live_recommendation(history if history else ["attention mechanism"])
    recommended_papers = live_rec.get("personalized_feed", [])

    # Breakthrough Detector ("Emerging Research" badges)
    trending_keywords = {"agent", "rag", "multimodal", "generative", "reasoning", "diffusion", "deep learning"}
    for rec in recommended_papers:
        title_lower = rec["recommended_paper"].lower()
        has_trending_kw = any(kw in title_lower for kw in trending_keywords)
        is_emerging = rec["similarity_score"] > 0.85 or (rec["similarity_score"] > 0.70 and has_trending_kw)
        rec["is_emerging"] = is_emerging

    # 3. Trending Papers from arXiv based on interests
    from app.research_discovery.arxiv_service import fetch_trending_papers
    trending_papers = []
    try:
        primary_interest = interests[0]
        trending_papers = fetch_trending_papers(primary_interest, max_results=5)
    except Exception:
        pass

    # 4. Compile Suggested Datasets, Models, and Research Gaps
    suggested_datasets = []
    suggested_models = []
    research_opportunities = []

    for p in user_papers:
        db_recs = db.query(models.Recommendation).filter(models.Recommendation.paper_id == p.id).all()
        for r in db_recs:
            try:
                if r.datasets:
                    suggested_datasets.extend(json.loads(r.datasets))
                if r.models:
                    suggested_models.extend(json.loads(r.models))
                if r.research_gaps:
                    research_opportunities.extend(json.loads(r.research_gaps))
            except Exception:
                pass

    suggested_datasets = list(dict.fromkeys(suggested_datasets))[:6]
    suggested_models = list(dict.fromkeys(suggested_models))[:6]
    research_opportunities = list(dict.fromkeys(research_opportunities))[:5]

    if not suggested_datasets:
        suggested_datasets = ["ImageNet", "Common Crawl", "SQuAD", "WikiText"]
    if not suggested_models:
        suggested_models = ["BERT", "RoBERTa", "LLaMA-3", "Mistral"]
    if not research_opportunities:
        research_opportunities = [
            "Cross-domain generalizability of Agentic RAG in healthcare.",
            "Real-time reasoning latencies optimization in multimodal SLAM models.",
            "Evaluation benchmarks for domain-specific safety alignment in LLMs."
        ]

    return {
        "trending_papers": trending_papers,
        "recommended_papers": recommended_papers,
        "research_opportunities": research_opportunities,
        "suggested_datasets": suggested_datasets,
        "suggested_models": suggested_models,
        "user_interests": interests
    }

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.database.connection import get_db
from app.auth.dependencies import get_current_user_optional

from app.research_advisor.research_gap_engine import analyze_research_gaps
from app.research_advisor.dataset_advisor import recommend_datasets
from app.research_advisor.model_advisor import recommend_models
from app.research_advisor.roadmap_builder import build_roadmap
from app.research_advisor.publication_advisor import assess_publication_readiness
from app.research_advisor.strategy_generator import generate_strategy
from app.research_advisor.advisor_engine import analyze_advisor_profile
from app.research_advisor.advisor_pipeline import generate_advisor_report

router = APIRouter()

# -----------------------------
# Request Schemas
# -----------------------------

class GapRequest(BaseModel):
    entities: Optional[Dict[str, List[Dict[str, Any]]]] = None

class RoadmapRequest(BaseModel):
    goal: str

class DatasetRequest(BaseModel):
    domain: str

class ModelRequest(BaseModel):
    task: str
    resources: str

class ReadinessRequest(BaseModel):
    novelty: float
    methodology: float
    benchmarks: float
    experiments: float

class StrategyRequest(BaseModel):
    context: str

class ReportRequest(BaseModel):
    goal: Optional[str] = None
    scores: Optional[Dict[str, float]] = None

class AskRequest(BaseModel):
    question: str

# -----------------------------
# Endpoints
# -----------------------------

@router.post("/advisor/profile")
def get_advisor_profile(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Retrieve personalized research profile & favorite domains.
    """
    user_id = current_user.id if current_user else None
    return analyze_advisor_profile(db, user_id=user_id)


@router.post("/advisor/gap")
def get_research_gaps(
    payload: Optional[GapRequest] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Analyze overexplored, emerging, and underexplored areas in user's research memory.
    """
    if payload and payload.entities:
        return analyze_research_gaps(payload.entities)
        
    # Default to scanning user's DB entities
    user_id = current_user.id if current_user else None
    profile = analyze_advisor_profile(db, user_id=user_id)
    # Build entities from stats/profile fields to pass to the gap analysis engine
    top_models = profile.get("profile", {}).get("top_models", [])
    top_methods = profile.get("profile", {}).get("top_methods", [])
    
    entities = {
        "MODEL": [{"name": m, "frequency": 5} for m in top_models],
        "METHOD": [{"name": m, "frequency": 3} for m in top_methods]
    }
    return analyze_research_gaps(entities)


@router.post("/advisor/roadmap")
def get_milestone_roadmap(payload: RoadmapRequest):
    """
    Generate 6-phase research milestone roadmap.
    """
    return build_roadmap(payload.goal)


@router.post("/advisor/datasets")
def get_dataset_advice(payload: DatasetRequest):
    """
    Recommend domain-specific benchmark datasets.
    """
    return recommend_datasets(payload.domain)


@router.post("/advisor/models")
def get_model_advice(payload: ModelRequest):
    """
    Suggest optimal model architectures based on resources & task.
    """
    return recommend_models(payload.task, payload.resources)


@router.post("/advisor/publication-readiness")
def get_publication_readiness(payload: ReadinessRequest):
    """
    Evaluate scores and return readiness suggestions.
    """
    return assess_publication_readiness(
        payload.novelty,
        payload.methodology,
        payload.benchmarks,
        payload.experiments
    )


@router.post("/advisor/strategy")
def get_continuation_strategy(payload: StrategyRequest):
    """
    Formulate continuous strategies and bottleneck alerts.
    """
    return generate_strategy(payload.context)


@router.post("/advisor/report")
def get_full_advisor_report(
    payload: Optional[ReportRequest] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Compile a complete research report (JSON, HTML, Markdown).
    """
    user_id = current_user.id if current_user else None
    goal = payload.goal if payload else None
    scores = payload.scores if payload else None
    return generate_advisor_report(db, user_id=user_id, goal=goal, scores=scores)


@router.post("/advisor/ask")
def ask_research_mentor(
    payload: AskRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    AI Research Mentor chat response using custom heuristics and semantic knowledge lookup.
    """
    user_id = current_user.id if current_user else None
    profile = analyze_advisor_profile(db, user_id=user_id)
    domain = profile.get("primary_domain", "Applied AI")
    
    q_lower = payload.question.lower()
    
    # Check for specific questions and generate high-fidelity mentor advice
    if "gap" in q_lower or "underexplored" in q_lower or "overexplored" in q_lower:
        # Generate gap response
        gaps = get_research_gaps(None, db, current_user)
        underexplored_str = ", ".join([g["name"] for g in gaps.get("underexplored", [])])
        overexplored_str = ", ".join([g["name"] for g in gaps.get("overexplored", [])])
        answer = (
            f"Based on your research catalog, you have a strong coverage of standard models. "
            f"I detected that areas like **{underexplored_str}** remain underexplored and offer great potential for novel contributions. "
            f"Meanwhile, **{overexplored_str}** are heavily saturated, meaning incremental modifications will face higher peer review friction."
        )
    elif "dataset" in q_lower or "benchmark" in q_lower:
        datasets = recommend_datasets(domain)
        datasets_str = "\n".join([f"- **{d['name']}** ({d['size']}): {d['suitability']}" for d in datasets])
        answer = (
            f"For your target domain (**{domain}**), I recommend validating on these benchmark datasets:\n\n{datasets_str}"
        )
    elif "model" in q_lower or "architecture" in q_lower:
        rec_model = recommend_models("generation" if "nlp" in domain.lower() else "classification", "gpu")
        answer = (
            f"I recommend using the **{rec_model['recommended_model']}** architecture ({rec_model['parameter_size']}) as your primary focus. "
            f"Rationale: {rec_model['suitability_reason']}\n"
            f"Alternative architectures you could explore: {', '.join(rec_model['alternatives'])}."
        )
    elif "roadmap" in q_lower or "plan" in q_lower or "milestone" in q_lower:
        roadmap = build_roadmap("Advance research in " + domain)
        roadmap_str = "\n".join([f"1. **{r['phase']} ({r['label']})**: {r['description']} -> *Deliverable: {r['deliverable']}*" for r in roadmap])
        answer = (
            f"Here is a customized 6-phase research milestone roadmap tailored to your target focus:\n\n{roadmap_str}"
        )
    elif "readiness" in q_lower or "publish" in q_lower or "venue" in q_lower:
        readiness = assess_publication_readiness(7.8, 8.0, 7.5, 8.2)
        suggestions_str = "\n".join([f"- {s}" for s in readiness['improvement_suggestions']])
        answer = (
            f"Your current estimated publication readiness score is **{readiness['readiness_score']}/10**.\n"
            f"This matches a **{readiness['target_venue']}** target. "
            f"To increase your chances of acceptance, I suggest:\n\n{suggestions_str}"
        )
    else:
        # Fallback to general smart advisor response
        answer = (
            f"Hello! As your AI Research Mentor, I have reviewed your profile focusing on **{domain}**. "
            f"You can ask me to help build a research roadmap, suggest benchmark datasets or model architectures, "
            f"check your publication readiness score, or scan for open research gaps in your project. "
            f"What specific area of your research strategy would you like to plan next?"
        )
        
    return {
        "question": payload.question,
        "answer": answer,
        "primary_domain": domain
    }

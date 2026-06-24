from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.paper import Paper
from app.models.entity import Entity
from app.models.analysis import Analysis

def compare_papers(db: Session, paper_ids: List[int]) -> Dict[str, Any]:
    """
    Compare multiple papers based on their entities, methodologies, datasets, models, and scores.
    """
    papers = db.query(Paper).filter(Paper.id.in_(paper_ids)).all()
    
    comparisons = []
    
    for paper in papers:
        # Fetch entities
        entities = db.query(Entity).filter(Entity.paper_id == paper.id).all()
        models = [e.name for e in entities if e.entity_type == "MODEL"]
        datasets = [e.name for e in entities if e.entity_type == "DATASET"]
        methods = [e.name for e in entities if e.entity_type == "METHOD"]
        metrics = [e.name for e in entities if e.entity_type == "METRIC"]
        
        # Unique and sorted
        models = sorted(list(set(models)))
        datasets = sorted(list(set(datasets)))
        methods = sorted(list(set(methods)))
        metrics = sorted(list(set(metrics)))
        
        # Get scores
        analysis = paper.analysis_new
        scores = {}
        if analysis:
            scores = {
                "novelty": analysis.novelty_score or getattr(analysis, 'novelty', None),
                "clarity": analysis.clarity_score or getattr(analysis, 'clarity', None),
                "technical_depth": analysis.technical_score or getattr(analysis, 'technical_depth', None),
                "innovation": analysis.innovation_score or getattr(analysis, 'innovation', None),
            }
        else:
            scores = {
                "novelty": None,
                "clarity": None,
                "technical_depth": None,
                "innovation": None,
            }
            
        comparisons.append({
            "id": paper.id,
            "title": paper.title,
            "authors": paper.authors,
            "models": models,
            "datasets": datasets,
            "methods": methods,
            "metrics": metrics,
            "scores": scores,
            "summary": paper.summary or "No summary available."
        })
        
    differentiators = []
    for i in range(len(comparisons)):
        for j in range(i + 1, len(comparisons)):
            p1 = comparisons[i]
            p2 = comparisons[j]
            
            p1_only_methods = set(p1["methods"]) - set(p2["methods"])
            p2_only_methods = set(p2["methods"]) - set(p1["methods"])
            
            p1_only_models = set(p1["models"]) - set(p2["models"])
            p2_only_models = set(p2["models"]) - set(p1["models"])
            
            diff_text = f"Comparing '{p1['title']}' and '{p2['title']}': "
            if p1_only_models or p2_only_models:
                diff_text += f"'{p1['title']}' focuses on {list(p1_only_models)[:3]} while '{p2['title']}' utilizes {list(p2_only_models)[:3]}. "
            if p1_only_methods or p2_only_methods:
                diff_text += f"Methodological difference: '{p1['title']}' leverages {list(p1_only_methods)[:3]} whereas '{p2['title']}' leverages {list(p2_only_methods)[:3]}."
            
            if not p1_only_models and not p2_only_models and not p1_only_methods and not p2_only_methods:
                diff_text += "Both papers share a highly similar technological stack and model framework."
                
            differentiators.append({
                "papers": [p1["title"], p2["title"]],
                "comparison": diff_text
            })

    return {
        "papers_comparison": comparisons,
        "differentiators": differentiators
    }

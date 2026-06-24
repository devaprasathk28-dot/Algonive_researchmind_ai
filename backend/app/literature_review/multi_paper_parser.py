from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.paper import Paper
from app.models.entity import Entity

def parse_multiple_papers(db: Session, paper_ids: List[int]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Query, clean, and merge academic entities across multiple papers.
    Groups by entity type (MODEL, DATASET, METHOD, TASK, FRAMEWORK, METRIC)
    and combines occurrences.
    """
    entities = db.query(Entity).filter(Entity.paper_id.in_(paper_ids)).all()
    papers = db.query(Paper).filter(Paper.id.in_(paper_ids)).all()
    paper_map = {p.id: p.title for p in papers}

    # Consolidated entities structure: entity_type -> entity_name_lower -> details
    consolidated: Dict[str, Dict[str, Dict[str, Any]]] = {}

    for ent in entities:
        etype = ent.entity_type or "OTHER"
        ename = ent.name or ""
        ename_clean = ename.strip()
        if not ename_clean:
            continue
        
        ename_lower = ename_clean.lower()
        
        if etype not in consolidated:
            consolidated[etype] = {}
            
        if ename_lower not in consolidated[etype]:
            consolidated[etype][ename_lower] = {
                "name": ename_clean,
                "papers": [],
                "paper_ids": [],
                "frequency": 0,
                "casings": {}
            }
            
        group = consolidated[etype][ename_lower]
        group["casings"][ename_clean] = group["casings"].get(ename_clean, 0) + ent.frequency
        group["frequency"] += ent.frequency
        if ent.paper_id not in group["paper_ids"]:
            group["paper_ids"].append(ent.paper_id)
            group["papers"].append(paper_map.get(ent.paper_id, f"Paper #{ent.paper_id}"))

    # Determine final casing and format response
    result: Dict[str, List[Dict[str, Any]]] = {}
    for etype, entities_dict in consolidated.items():
        result[etype] = []
        for ename_lower, group in entities_dict.items():
            best_casing = max(group["casings"].items(), key=lambda x: x[1])[0]
            result[etype].append({
                "name": best_casing,
                "papers": group["papers"],
                "paper_ids": group["paper_ids"],
                "frequency": group["frequency"]
            })
        result[etype].sort(key=lambda x: x["frequency"], reverse=True)

    return result

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database import models
import json

from app.knowledge_graph.knowledge_pipeline import generate_knowledge_graph

router = APIRouter(tags=["knowledge-graph"])


@router.post("/generate-knowledge-graph")
@router.post("/knowledge-graph/generate", include_in_schema=False)
def generate_graph(parsed_paper: dict, db: Session = Depends(get_db)):
    paper_id = parsed_paper.get("id")
    if paper_id:
        db_graph = db.query(models.KnowledgeGraph).filter(models.KnowledgeGraph.paper_id == int(paper_id)).first()
        if db_graph:
            try:
                nodes = json.loads(db_graph.nodes_json)
                edges = json.loads(db_graph.edges_json)
                
                # Fetch metrics or fallback
                metrics = {}
                ecosystem = {}
                if db_graph.graph_metrics:
                    metrics_data = json.loads(db_graph.graph_metrics)
                    metrics = metrics_data.get("metrics", {})
                    ecosystem = metrics_data.get("ecosystem", {})
                
                return {
                    "nodes": nodes,
                    "edges": edges,
                    "entities": [
                        {"text": node["id"], "label": node["label"]}
                        for node in nodes
                    ],
                    "relationships": edges,
                    "total_nodes": db_graph.entity_count,
                    "total_edges": db_graph.relation_count,
                    "metrics": metrics,
                    "ecosystem": ecosystem
                }
            except Exception:
                pass

    try:
        result = generate_knowledge_graph(parsed_paper)
        if paper_id:
            # Overwrite any existing graph to avoid duplicate key issues on re-parse
            db.query(models.KnowledgeGraph).filter(models.KnowledgeGraph.paper_id == int(paper_id)).delete()
            
            metrics_payload = {
                "metrics": result.get("metrics", {}),
                "ecosystem": result.get("ecosystem", {})
            }
            db_graph = models.KnowledgeGraph(
                paper_id=int(paper_id),
                nodes_json=json.dumps(result.get("nodes", [])),
                edges_json=json.dumps(result.get("edges", [])),
                entity_count=result.get("total_nodes", len(result.get("nodes", []))),
                relation_count=result.get("total_edges", len(result.get("edges", []))),
                graph_metrics=json.dumps(metrics_payload)
            )
            db.add(db_graph)
            db.commit()
            db.refresh(db_graph)
        return result
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


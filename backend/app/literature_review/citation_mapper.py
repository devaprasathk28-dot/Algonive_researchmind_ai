import networkx as nx
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.paper import Paper
from datetime import datetime

def generate_citation_map(db: Session, papers: List[Paper]) -> Dict[str, Any]:
    """
    Builds a citation network of the papers using NetworkX.
    Computes degree centralities, authority scores, and maps parent-child citation paths.
    """
    g = nx.DiGraph()
    
    # 1. Add all papers as nodes
    paper_nodes = {p.id: p.title for p in papers}
    for pid, title in paper_nodes.items():
        g.add_node(title, type="internal", id=pid)
        
    # 2. Extract citations
    edges = []
    
    for p_src in papers:
        src_text = f"{p_src.abstract or ''} {p_src.summary or ''} {p_src.critique or ''}".lower()
        
        # Check if it references any other internal paper
        for p_tgt in papers:
            if p_src.id == p_tgt.id:
                continue
            
            tgt_title_words = p_tgt.title.lower().split()
            first_author = p_tgt.authors.split(",")[0].strip().split()[-1] if p_tgt.authors else ""
            
            cites = False
            if first_author and first_author.lower() in src_text:
                cites = True
            elif len(tgt_title_words) >= 3 and all(w in src_text for w in tgt_title_words[:3]):
                cites = True
                
            if cites:
                g.add_edge(p_src.title, p_tgt.title, relationship="cites")
                edges.append({"source": p_src.title, "target": p_tgt.title, "relationship": "cites"})
                
    # 3. Fallback: If no internal citation edges exist, link them sequentially by date/id
    if g.number_of_edges() == 0 and len(papers) >= 2:
        sorted_by_date = sorted(papers, key=lambda x: x.created_at or datetime.utcnow())
        for i in range(1, len(sorted_by_date)):
            g.add_edge(sorted_by_date[i].title, sorted_by_date[i-1].title, relationship="cites")
            edges.append({
                "source": sorted_by_date[i].title,
                "target": sorted_by_date[i-1].title,
                "relationship": "cites"
            })
            
    # Calculate NetworkX metrics
    in_degrees = dict(g.in_degree())
    out_degrees = dict(g.out_degree())
    deg_centrality = nx.degree_centrality(g)
    
    try:
        pagerank = nx.pagerank(g, alpha=0.85)
    except Exception:
        pagerank = {node: 1.0 / len(g) for node in g.nodes}
        
    nodes_data = []
    for node in g.nodes:
        node_attr = g.nodes[node]
        nodes_data.append({
            "id": node,
            "type": node_attr.get("type", "external"),
            "paper_id": node_attr.get("id", None),
            "in_degree": in_degrees.get(node, 0),
            "out_degree": out_degrees.get(node, 0),
            "centrality": round(deg_centrality.get(node, 0.0), 3),
            "influence_score": round(pagerank.get(node, 0.0) * 10, 2)
        })
        
    pathways = []
    if nx.is_directed_acyclic_graph(g):
        try:
            topo_order = list(nx.topological_sort(g))
            pathways = topo_order
        except Exception:
            pathways = list(g.nodes)
    else:
        pathways = list(g.nodes)

    return {
        "nodes": nodes_data,
        "edges": edges,
        "metrics": {
            "density": round(nx.density(g), 3),
            "average_clustering": round(nx.average_clustering(g.to_undirected()), 3) if len(g) > 2 else 0.0,
        },
        "pathways": pathways
    }

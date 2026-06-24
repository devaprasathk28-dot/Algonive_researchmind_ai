import networkx as nx
from typing import List, Dict, Any

def build_graph(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> nx.DiGraph:
    """
    Construct a standardized NetworkX DiGraph from raw nodes and edges lists.
    """
    g = nx.DiGraph()
    # Add nodes and properties
    for node in nodes:
        node_id = str(node.get("id", "")).lower().strip()
        if node_id:
            g.add_node(node_id, label=node.get("label", "CONCEPT").upper())

    # Add edges and properties
    for edge in edges:
        src = str(edge.get("source", "")).lower().strip()
        tgt = str(edge.get("target", "")).lower().strip()
        relation = str(edge.get("relation", "USES")).upper().strip()
        if src and tgt:
            g.add_edge(src, tgt, relation=relation)
            # Add implicit nodes if not already present
            if src not in g.nodes:
                g.nodes[src]["label"] = "CONCEPT"
            if tgt not in g.nodes:
                g.nodes[tgt]["label"] = "CONCEPT"
    return g

def calculate_graph_similarity(g1: nx.DiGraph, g2: nx.DiGraph) -> float:
    """
    Compute structural similarity between two NetworkX directed graphs.
    Combines Graph Edit Distance (GED) on key subgraphs and Edge Triple Jaccard.
    """
    if len(g1) == 0 and len(g2) == 0:
        return 1.0
    if len(g1) == 0 or len(g2) == 0:
        return 0.0

    try:
        # 1. Calculate overlap of semantic edge triples (source, relation, target)
        edges1 = {(u, d.get("relation", "USES"), v) for u, v, d in g1.edges(data=True)}
        edges2 = {(u, d.get("relation", "USES"), v) for u, v, d in g2.edges(data=True)}
        
        if not edges1 and not edges2:
            edge_jaccard = 0.0
        else:
            edge_jaccard = len(edges1.intersection(edges2)) / len(edges1.union(edges2))

        # 2. Graph Edit Distance (GED) on top central nodes subgraph
        # Limit subgraph size to top 8 nodes to avoid NP-hard timeouts or CPU spikes
        sub1 = _get_top_subgraph(g1, limit=8)
        sub2 = _get_top_subgraph(g2, limit=8)

        # Calculate GED using NetworkX's search solver with a strict 0.5s timeout
        ged = nx.graph_edit_distance(sub1, sub2, timeout=0.5)
        if ged is None:
            # Fallback distance if search times out
            ged = len(sub1) + len(sub2)

        max_nodes = max(len(sub1), len(sub2), 1)
        ged_similarity = 1.0 - (ged / (max_nodes * 2))
        ged_similarity = max(0.0, min(1.0, ged_similarity))

        # Combine: 60% structural GED and 40% exact edge-triple Jaccard
        return float(0.6 * ged_similarity + 0.4 * edge_jaccard)
    except Exception:
        return 0.0

def _get_top_subgraph(g: nx.DiGraph, limit: int = 8) -> nx.DiGraph:
    """
    Extract a subgraph of nodes with the highest degree centrality.
    """
    if len(g) <= limit:
        return g
    centrality = nx.degree_centrality(g)
    top_nodes = sorted(centrality.keys(), key=lambda x: centrality[x], reverse=True)[:limit]
    return g.subgraph(top_nodes)

import networkx as nx

def calculate_graph_metrics(graph: nx.DiGraph) -> dict:
    """
    Calculate structural graph metrics and overall Knowledge Graph Quality Score.
    """
    total_nodes = len(graph)
    total_edges = graph.number_of_edges()
    
    if total_nodes == 0:
        return {
            "density": 0.0,
            "quality_score": 1.0,
            "typed_nodes_ratio": 0.0
        }

    # 1. Structural density
    density = nx.density(graph)

    # 2. Entity Quality (ratio of typed academic categories vs general concepts)
    typed_labels = {"MODEL", "DATASET", "METHOD", "FRAMEWORK", "TASK", "METRIC", "PERSON", "ORG"}
    typed_nodes_count = sum(1 for _, data in graph.nodes(data=True) if data.get("label", "").upper() in typed_labels)
    typed_ratio = typed_nodes_count / total_nodes
    entity_quality = typed_ratio * 10.0

    # 3. Connectivity Score
    # Degree density or average connectivity in standard clusters
    connectivity = min(density * 25.0, 10.0)
    if total_nodes > 2:
        # Boost score slightly if nodes are well connected (not disconnected isolates)
        isolates = list(nx.isolates(graph))
        non_isolates_ratio = (total_nodes - len(isolates)) / total_nodes
        connectivity = (connectivity * 0.7) + (non_isolates_ratio * 3.0)

    # 4. Relation Count Score
    # Number of valid edges, scaled to 10
    relation_score = min(total_edges / 3.0, 10.0)

    # 5. graph_quality = (relation_count * 0.4 + entity_quality * 0.3 + connectivity * 0.3)
    graph_quality = (relation_score * 0.4 + entity_quality * 0.3 + connectivity * 0.3)
    graph_quality = round(max(1.0, min(10.0, graph_quality)), 1)

    return {
        "density": round(density, 4),
        "quality_score": graph_quality,
        "typed_nodes_ratio": round(typed_ratio, 2),
        "total_nodes": total_nodes,
        "total_edges": total_edges
    }

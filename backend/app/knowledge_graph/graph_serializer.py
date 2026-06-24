import networkx as nx


def serialize_graph(graph: nx.DiGraph, centrality: dict = None, communities: dict = None) -> dict:
    if centrality is None:
        centrality = {}
    if communities is None:
        communities = {}

    nodes = [
        {
            "id": node,
            "label": data.get("label", "CONCEPT"),
            "mention_count": data.get("mention_count", 1),
            "frequency": data.get("frequency", data.get("mention_count", 1)),
            "confidence": data.get("confidence", 0.95),
            "centrality": float(centrality.get(node, 0.0)),
            "community": int(communities.get(node, 0))
        }
        for node, data in graph.nodes(data=True)
    ]

    edges = [
        {
            "source": source,
            "target": target,
            "relation": data.get("relation", "USES"),
            "relations": data.get("relations", []),
            "weight": data.get("weight", 1),
        }
        for source, target, data in graph.edges(data=True)
    ]

    return {"nodes": nodes, "edges": edges}


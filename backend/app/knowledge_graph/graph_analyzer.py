import networkx as nx
import community

def analyze_graph(graph: nx.DiGraph) -> dict:
    """
    Run NetworkX centrality and Louvain community detection.
    Extract key connected models, datasets, and frameworks.
    """
    if len(graph) == 0:
        return {
            "centrality": {},
            "communities": {},
            "ecosystem": {
                "top_model": "None",
                "top_dataset": "None",
                "top_framework": "None",
                "top_method": "None"
            }
        }

    # 1. Degree Centrality
    centrality_raw = nx.degree_centrality(graph)
    centrality = {node: round(score, 3) for node, score in centrality_raw.items()}

    # 2. Community Detection (Louvain partitioning)
    try:
        # Louvain requires an undirected graph representation
        undirected = graph.to_undirected()
        communities = community.best_partition(undirected)
    except Exception:
        # Fallback if partitioning fails (e.g. empty or single nodes)
        communities = {node: 0 for node in graph.nodes}

    # 3. Ecosystem Insights
    top_model = "None"
    top_dataset = "None"
    top_framework = "None"
    top_method = "None"
    
    max_model_score = -1.0
    max_dataset_score = -1.0
    max_framework_score = -1.0
    max_method_score = -1.0
    
    for node_id, data in graph.nodes(data=True):
        label = data.get("label", "CONCEPT").upper()
        score = centrality.get(node_id, 0.0)
        
        if label == "MODEL" and score > max_model_score:
            max_model_score = score
            top_model = node_id
        elif label == "DATASET" and score > max_dataset_score:
            max_dataset_score = score
            top_dataset = node_id
        elif label == "FRAMEWORK" and score > max_framework_score:
            max_framework_score = score
            top_framework = node_id
        elif label in ("METHOD", "CONCEPT") and score > max_method_score:
            max_method_score = score
            top_method = node_id

    return {
        "centrality": centrality,
        "communities": communities,
        "ecosystem": {
            "top_model": top_model,
            "top_dataset": top_dataset,
            "top_framework": top_framework,
            "top_method": top_method
        }
    }

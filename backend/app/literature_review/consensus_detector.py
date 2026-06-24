from typing import List, Dict, Any

def detect_consensus(consolidated_entities: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    """
    Detect shared methodologies, models, datasets, and tasks across multiple papers.
    Returns a list of consensus points.
    """
    consensus_points = []

    # 1. Dataset Consensus (shared benchmarks)
    datasets = consolidated_entities.get("DATASET", [])
    for ds in datasets:
        if len(ds["paper_ids"]) >= 2:
            consensus_points.append({
                "category": "Benchmark Consensus",
                "statement": f"Agreement on utilizing '{ds['name']}' as a standard benchmark dataset for evaluation.",
                "supporting_papers": ds["papers"],
                "entity": ds["name"]
            })

    # 2. Model/Architecture Consensus
    models = consolidated_entities.get("MODEL", [])
    for model in models:
        if len(model["paper_ids"]) >= 2:
            consensus_points.append({
                "category": "Architectural Consensus",
                "statement": f"Adoption of '{model['name']}' as the core model architecture or baseline.",
                "supporting_papers": model["papers"],
                "entity": model["name"]
            })

    # 3. Method Consensus
    methods = consolidated_entities.get("METHOD", [])
    for method in methods:
        if len(method["paper_ids"]) >= 2:
            consensus_points.append({
                "category": "Methodological Consensus",
                "statement": f"Shared employment of '{method['name']}' for optimization, training, or modeling.",
                "supporting_papers": method["papers"],
                "entity": method["name"]
            })

    # 4. Task Consensus
    tasks = consolidated_entities.get("TASK", [])
    for task in tasks:
        if len(task["paper_ids"]) >= 2:
            consensus_points.append({
                "category": "Research Goal Consensus",
                "statement": f"Common objective of solving or advancing '{task['name']}' tasks.",
                "supporting_papers": task["papers"],
                "entity": task["name"]
            })

    return consensus_points[:8]

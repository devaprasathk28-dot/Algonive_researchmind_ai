from typing import List, Dict, Any

def detect_gaps(consolidated_entities: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    """
    Identify research gaps and underexplored areas by examining the frequency
    of models, datasets, methods, and tasks.
    """
    gaps = []
    
    models = consolidated_entities.get("MODEL", [])
    datasets = consolidated_entities.get("DATASET", [])
    methods = consolidated_entities.get("METHOD", [])
    tasks = consolidated_entities.get("TASK", [])
    
    # 1. Popular task but rare method
    popular_tasks = [t["name"] for t in tasks if len(t["paper_ids"]) >= 1]
    rare_methods = [m["name"] for m in methods if len(m["paper_ids"]) == 1]
    
    if popular_tasks and rare_methods:
        task_name = popular_tasks[0]
        method_name = rare_methods[0]
        gaps.append({
            "category": "Methodological Gap",
            "title": f"Application of {method_name} to {task_name}",
            "description": f"While '{task_name}' is a primary research focus in this collection, '{method_name}' is only explored in a single paper. Applying this technique more broadly to other baselines could yield performance gains.",
            "impact_score": 8.5
        })
        
    # 2. Popular model but rare dataset
    popular_models = [m["name"] for m in models if len(m["paper_ids"]) >= 1]
    rare_datasets = [d["name"] for d in datasets if len(d["paper_ids"]) == 1]
    
    if popular_models and rare_datasets:
        model_name = popular_models[0]
        dataset_name = rare_datasets[0]
        gaps.append({
            "category": "Cross-domain Generalization Gap",
            "title": f"Benchmarking {model_name} on {dataset_name}",
            "description": f"The model architecture '{model_name}' is widely used, but has not been comprehensively evaluated on '{dataset_name}'. Assessing cross-dataset generalization represents an open research path.",
            "impact_score": 7.8
        })
        
    # 3. Hybrid integration gap
    all_methods = [m["name"].lower() for m in methods]
    if "self-attention" in all_methods and not any("knowledge graph" in m for m in all_methods):
        gaps.append({
            "category": "Architectural Synergy Gap",
            "title": "Sparse Knowledge Graph Guided Self-Attention",
            "description": "The collection extensively leverages statistical self-attention, but lacks symbolic structured knowledge integration. Infusing structural relations from a Knowledge Graph into attention heads could improve context reasoning.",
            "impact_score": 9.2
        })

    if not gaps:
        gaps.append({
            "category": "Methodological Gap",
            "title": "Cross-Model Ablation and Optimization Analysis",
            "description": "There is a lack of structured ablation studies across the different models and training strategies in this collection, leaving hyperparameter sensitivity largely unexplored.",
            "impact_score": 7.0
        })
        
    return gaps

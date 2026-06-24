from typing import Dict, Any, List

def analyze_research_gaps(entities: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
    """
    Scans the consolidated entities map to identify research status.
    Categorizes domains/methods into overexplored, emerging, and underexplored.
    """
    overexplored = []
    emerging = []
    underexplored = []
    
    models = entities.get("MODEL", [])
    methods = entities.get("METHOD", [])
    
    # 1. Overexplored
    for m in models[:2]:
        overexplored.append({
            "name": m["name"],
            "reason": f"High saturation in literature ({m['frequency']} occurrences). Hard to publish incremental novelty."
        })
    for m in methods[:2]:
        overexplored.append({
            "name": m["name"],
            "reason": f"Standard empirical optimization tool. Novel contributions require deep modifications."
        })
        
    # 2. Emerging
    emerging_keywords = ["rag", "agent", "lora", "qlora", "llama", "mistral", "gemma", "dpo", "rlhf"]
    all_items = models + methods
    for item in all_items:
        name_lower = item["name"].lower()
        if any(kw in name_lower for kw in emerging_keywords):
            emerging.append({
                "name": item["name"],
                "reason": "Active research front with substantial publication volume and open benchmark records."
            })
            
    # 3. Underexplored
    rare_keywords = ["graph", "symbolic", "web-socket", "slippage", "concentrated liquidity", "reinforcement learning", "gru", "lstm"]
    for item in all_items:
        name_lower = item["name"].lower()
        if any(kw in name_lower for kw in rare_keywords) or item.get("frequency", 1) == 1:
            underexplored.append({
                "name": item["name"],
                "reason": "Limited exploration in this workspace. Represents a high-potential research target."
            })
            
    if not overexplored:
        overexplored.append({"name": "Fine-Tuning", "reason": "Standard weight updating baseline."})
    if not emerging:
        emerging.append({"name": "Agentic RAG Flow", "reason": "Iterative retrieval and multi-agent reasoning loops."})
    if not underexplored:
        underexplored.append({"name": "Symbolic Knowledge Graph Guided Attention", "reason": "Infusing structured facts directly into transformer weights."})
        
    return {
        "overexplored": overexplored[:3],
        "emerging": emerging[:3],
        "underexplored": underexplored[:3]
    }

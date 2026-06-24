from typing import List, Dict, Any

def analyze_trends(consolidated_entities: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
    """
    Analyzes consolidated entities to extract top research trends.
    """
    trends = {}
    categories = ["MODEL", "DATASET", "METHOD", "TASK", "FRAMEWORK", "METRIC"]
    
    for category in categories:
        items = consolidated_entities.get(category, [])
        trends[category.lower() + "s"] = [
            {
                "name": item["name"],
                "frequency": item["frequency"],
                "paper_count": len(item["paper_ids"])
            }
            for item in items[:10]
        ]
        
    distribution = []
    for category in categories:
        items = consolidated_entities.get(category, [])
        total_freq = sum(item["frequency"] for item in items)
        unique_count = len(items)
        distribution.append({
            "category": category,
            "total_frequency": total_freq,
            "unique_count": unique_count
        })
        
    trends["distribution"] = distribution
    return trends

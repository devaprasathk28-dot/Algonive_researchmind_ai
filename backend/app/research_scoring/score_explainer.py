def explain_scores(scores: dict) -> dict:
    """
    Format scoring results into an explainable structure with score, reason, and confidence per metric.
    """
    confidence = scores.get("confidence_score", 90.0)
    
    # Map keys to human readable labels and compile reasons
    metrics_map = {
        "novelty": "novelty",
        "clarity": "clarity",
        "innovation": "innovation",
        "technical_quality": "technical_quality",
        "reproducibility": "reproducibility",
        "dataset_quality": "dataset_quality"
    }
    
    explained = {}
    for key, metric in metrics_map.items():
        res = scores.get(key, {})
        reasons_list = res.get("evidence", [])
        
        # Combine top reasons into a coherent explanation string
        if reasons_list:
            reason = " ".join(reasons_list[:2])
        else:
            reason = f"Evaluated based on standard {metric.replace('_', ' ')} metrics and document signals."
            
        explained[metric] = {
            "score": res.get("score", 8.0),
            "reason": reason,
            "confidence": confidence
        }
        
    return explained

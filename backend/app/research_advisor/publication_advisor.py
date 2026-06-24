from typing import Dict, Any

def assess_publication_readiness(
    novelty: float, 
    methodology: float, 
    benchmarks: float, 
    experiments: float
) -> Dict[str, Any]:
    """
    Evaluate scores and return a publication readiness report with suggestions.
    """
    readiness = round((novelty + methodology + benchmarks + experiments) / 4.0, 1)
    
    if readiness >= 8.5:
        target = "Major Conference (e.g. NeurIPS, ICML, ACL)"
        difficulty = "Very High"
    elif readiness >= 7.0:
        target = "Core Conference / Workshop (e.g. EMNLP, CVPR Workshop)"
        difficulty = "High"
    else:
        target = "Local Workshop / Regional Symposium"
        difficulty = "Medium"
        
    suggestions = []
    if novelty < 7.5:
        suggestions.append("Improve theoretical framing: contrast your design explicitly with RoBERTa/BERT limits.")
    if methodology < 7.5:
        suggestions.append("Enhance mathematical rigor: formalize parameter adjustments and optimization objectives.")
    if benchmarks < 7.5:
        suggestions.append("Broaden benchmark scope: test on at least 2 additional public baseline datasets.")
    if experiments < 7.5:
        suggestions.append("Add ablation studies: isolate the impact of each custom neural block or scraping pipeline.")
        
    if not suggestions:
        suggestions.append("Excellent metrics. Focus on writing clarity, formal formatting, and upload source codes to GitHub.")
        
    return {
        "readiness_score": readiness,
        "target_venue": target,
        "difficulty_level": difficulty,
        "improvement_suggestions": suggestions
    }

import re

def calculate_innovation(text: str, evidence: dict) -> dict:
    """
    Score the paper's innovation based on contributions, research gaps addressed,
    and novel structural concepts introduced.
    """
    text_lower = text.lower() if text else ""
    
    # 1. Contributions score (out of 10)
    contrib_matches = len(re.findall(r'\b(contribution|contribute|our primary|we outline|key aspect)\b', text_lower))
    contrib_score = min(3.0 + (contrib_matches * 1.5), 10.0)
    
    # 2. Gaps addressed (out of 10)
    gap_matches = len(re.findall(r'\b(gap|limitation|shortcoming|weakness|hitherto|previous work fail|challenges|addressed)\b', text_lower))
    gap_score = min(2.0 + (gap_matches * 1.5), 10.0)
    
    # 3. Novel models/methods (out of 10)
    novel_entities = evidence.get("models", 0) + evidence.get("methods", 0)
    model_score = min(4.0 + (novel_entities * 0.8), 10.0)
    
    # Combine innovation score
    innovation_score = (
        contrib_score * 0.4 +
        gap_score * 0.3 +
        model_score * 0.3
    )
    innovation_score = round(max(1.0, min(10.0, innovation_score)), 1)
    
    # Generate reasons
    reasons = []
    if contrib_matches > 0:
        reasons.append(f"Explicitly details scientific contributions ({contrib_matches} contribution mentions).")
    else:
        reasons.append("Contributions are implicit rather than structured clearly in the intro.")
        
    if gap_matches > 0:
        reasons.append("Identifies clear limitations or gaps in prior works and proposes solutions.")
    else:
        reasons.append("Does not strongly outline existing gaps or shortcomings in related work.")
        
    if novel_entities >= 3:
        reasons.append(f"Combines multiple novel components, including models ({evidence.get('models')}) and methods.")
        
    return {
        "score": innovation_score,
        "evidence": reasons
    }

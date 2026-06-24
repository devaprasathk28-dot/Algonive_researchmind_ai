def calculate_novelty(text: str, evidence: dict) -> dict:
    """
    Score the paper's novelty based on proposed techniques, architecture patterns,
    cross-domain combinations, and citation profile.
    """
    text_lower = text.lower() if text else ""
    
    # 1. New Methods score (out of 10)
    # Scaled by occurrences of words like "we propose", "new approach"
    novel_terms_count = evidence.get("novel_terms", 0)
    new_methods = min(1.0 + (novel_terms_count * 1.5), 10.0)
    
    # 2. New Entities score (out of 10)
    # Number of specific model/method entities extracted
    new_entities = min(1.5 + (evidence.get("models", 0) * 1.0 + evidence.get("methods", 0) * 0.5), 10.0)
    
    # 3. Cross-Domain Links score (out of 10)
    # Check if vocabulary spans multiple subfields
    domains = {
        "NLP": ["rag", "llm", "transformer", "prompt", "retrieval", "text", "language"],
        "CV": ["image", "pixel", "convolutional", "vision", "segmentation", "detection", "resnet"],
        "Graphs": ["graph", "network", "node", "edge", "adjacency", "gcn"],
        "Optimization/RL": ["policy", "agent", "reinforcement", "reward", "gradient descent", "optimize"]
    }
    active_domains = 0
    for name, keywords in domains.items():
        if any(kw in text_lower for kw in keywords):
            active_domains += 1
            
    cross_domain_links = min(2.0 + (active_domains * 2.0), 10.0)
    
    # 4. Citation Uniqueness (out of 10)
    # Evaluates reference uniqueness based on total counts
    references_count = evidence.get("references", 0)
    citation_uniqueness = min(3.0 + (references_count * 0.15), 10.0)
    
    # 5. novelty_score = (new_methods * 0.4 + new_entities * 0.2 + cross_domain_links * 0.2 + citation_uniqueness * 0.2)
    novelty_score = (
        new_methods * 0.4 +
        new_entities * 0.2 +
        cross_domain_links * 0.2 +
        citation_uniqueness * 0.2
    )
    novelty_score = round(max(1.0, min(10.0, novelty_score)), 1)
    
    # 6. Generate evidence reasons
    reasons = []
    if novel_terms_count > 0:
        reasons.append(f"Explicitly proposes or introduces new research elements ({novel_terms_count} direct phrasing matches).")
    else:
        reasons.append("Identifies standard techniques but provides minimal direct claims of introducing new methods.")
        
    if evidence.get("models_list"):
        reasons.append(f"Introduces or adapts specific architectures: {', '.join(evidence['models_list'][:3])}.")
        
    if active_domains > 1:
        reasons.append(f"Demonstrates cross-domain integration across {active_domains} scientific subfields.")
        
    if references_count > 25:
        reasons.append(f"Built upon a highly diverse foundation of literature ({references_count} citation counts).")
        
    return {
        "score": novelty_score,
        "evidence": reasons
    }

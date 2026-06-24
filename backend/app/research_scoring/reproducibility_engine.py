import re

def calculate_reproducibility(text: str, evidence: dict) -> dict:
    """
    Score the paper's reproducibility based on code presence, public dataset links,
    and hyperparameter/training descriptions.
    """
    text_lower = text.lower() if text else ""
    
    # 1. Code Availability (out of 10)
    has_code = evidence.get("has_code", False)
    code_score = 10.0 if has_code else 3.0
    if not has_code:
        # Check text search for keywords indicating code will be released
        if any(w in text_lower for w in ["code is available", "github.com", "code repository", "source code"]):
            code_score = 8.5
            has_code = True

    # 2. Hyperparameters availability (out of 10)
    # Check mentions of learning rate, batch size, epochs, optimizers, seeds
    params = ["learning rate", "batch size", "epochs", "optimizer", "adam", "seed", "dropout", "weight decay"]
    param_matches = sum(1 for p in params if p in text_lower)
    param_score = min(2.0 + (param_matches * 1.25), 10.0)

    # 3. Training & Dataset setup (out of 10)
    setup_terms = ["training split", "validation set", "gpu", "hardware", "cuda", "train", "dataset split"]
    setup_matches = sum(1 for s in setup_terms if s in text_lower)
    setup_score = min(3.0 + (setup_matches * 1.2), 10.0)

    # Combine reproducibility score
    reproducibility_score = (
        code_score * 0.4 +
        param_score * 0.3 +
        setup_score * 0.3
    )
    reproducibility_score = round(max(1.0, min(10.0, reproducibility_score)), 1)

    # Generate reasons
    reasons = []
    if has_code:
        links = evidence.get("github_links", [])
        if links:
            reasons.append(f"Public code repository provided: {links[0]}.")
        else:
            reasons.append("Code availability mentioned in text.")
    else:
        reasons.append("No public code repository link detected in the document text.")
        
    if param_matches >= 4:
        reasons.append(f"Provides detailed hyperparameter listings ({param_matches} configuration parameters found).")
    else:
        reasons.append("Lacks detailed parameter optimization listings (learning rate, seeds, etc.).")
        
    if setup_matches >= 3:
        reasons.append("Describes the experimental dataset split and hardware configuration details.")
        
    return {
        "score": reproducibility_score,
        "evidence": reasons
    }

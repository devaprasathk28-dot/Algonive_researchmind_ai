import re

def calculate_technical_quality(text: str, evidence: dict) -> dict:
    """
    Score the technical quality of the paper by evaluating methods, experiments,
    and benchmark counts, and normalizing to 0-10.
    """
    # technical_quality = (method_count + experiment_count + benchmark_count)
    method_count = evidence.get("methods", 0)
    experiment_count = evidence.get("experiments", 0)
    benchmark_count = evidence.get("benchmarks", 0)
    
    raw_score = method_count * 1.2 + experiment_count * 0.8 + benchmark_count * 1.5
    
    # Normalize to 0-10 scale
    # Base starts at 4.0 if we have at least 1 experiment
    base = 4.0 if experiment_count > 0 else 2.0
    technical_quality = min(base + raw_score * 0.5, 10.0)
    
    # Ensure it's reasonable
    technical_quality = round(max(1.0, min(10.0, technical_quality)), 1)
    
    # Generate reasons
    reasons = []
    if method_count > 0:
        reasons.append(f"Employs {method_count} distinct methodology algorithms or frameworks.")
    else:
        reasons.append("Relies on standard pipelines with minimal custom method formulations.")
        
    if experiment_count > 1:
        reasons.append(f"Validates findings across multiple ({experiment_count}) experiment trials/scenarios.")
        
    if benchmark_count > 0:
        reasons.append(f"Compares performance directly against {benchmark_count} baseline benchmarks.")
        
    # Check for ablation study
    if "ablation" in (text or "").lower():
        reasons.append("Includes ablation studies to verify the contributions of individual components.")
        
    return {
        "score": technical_quality,
        "evidence": reasons
    }

def calculate_dataset_quality(text: str, evidence: dict) -> dict:
    """
    Score the dataset quality of the paper based on dataset size, diversity,
    benchmark usage, and public availability.
    """
    text_lower = text.lower() if text else ""
    
    # 1. Dataset diversity (number of datasets used)
    datasets_count = evidence.get("datasets", 0)
    diversity_score = min(2.0 + (datasets_count * 2.0), 10.0)
    
    # 2. Dataset size & scale mentions
    # Search for terms like "million", "billion", "thousand", "parameters", "size", "gb", "tokens", "samples"
    size_terms = ["million", "thousand", "samples", "examples", "tokens", "gigabytes", "gb", "size of"]
    size_matches = sum(1 for s in size_terms if s in text_lower)
    size_score = min(3.0 + (size_matches * 1.2), 10.0)
    
    # 3. Public availability / standard benchmarks
    public_bench = ["publicly available", "download", "huggingface", "imagenet", "squad", "coco", "open-source", "released"]
    public_matches = sum(1 for p in public_bench if p in text_lower)
    public_score = min(4.0 + (public_matches * 1.0), 10.0)
    
    # Combine dataset score
    dataset_quality = (
        diversity_score * 0.4 +
        size_score * 0.3 +
        public_score * 0.3
    )
    dataset_quality = round(max(1.0, min(10.0, dataset_quality)), 1)
    
    # Generate reasons
    reasons = []
    if datasets_count > 0:
        reasons.append(f"Uses standard research datasets: {', '.join(evidence.get('datasets_list', []))}.")
    else:
        reasons.append("No specific datasets are explicitly named in the entity list.")
        
    if size_matches >= 3:
        reasons.append("Provides clear dataset scale metrics (size, samples, or tokens descriptions).")
        
    if public_matches >= 2:
        reasons.append("Relies on publicly auditable datasets or popular community benchmarks.")
        
    return {
        "score": dataset_quality,
        "evidence": reasons
    }

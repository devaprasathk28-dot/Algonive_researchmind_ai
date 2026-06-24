import re

def analyze_methodology(text: str) -> dict:
    """
    Evaluate structural depth of the methodology and experiments sections.
    """
    if not text:
        return {"level": "Weak", "score": 3.0}

    text_lower = text.lower()

    # Match section headers related to methodologies
    section_patterns = [
        r"(?i)\bmethodology\b",
        r"(?i)\bproposed method\b",
        r"(?i)\bexperimental setup\b",
        r"(?i)\bexperiments\b",
        r"(?i)\bevaluation\b",
        r"(?i)\bablation study\b"
    ]

    matched_sections_count = 0
    for pat in section_patterns:
        if re.search(pat, text_lower):
            matched_sections_count += 1

    # Match methodology vocabulary frequency
    methodology_terms = [
        "architecture", "framework", "algorithm", "dataset", "baseline",
        "training", "loss function", "parameters", "hyperparameters",
        "validation", "test set", "ablation", "comparative", "empirical"
    ]
    term_hits = sum(text_lower.count(term) for term in methodology_terms)

    # Scored on a scale of 0 to 10
    score = (matched_sections_count * 1.5) + min(term_hits / 8.0, 5.0)
    score = round(max(1.0, min(10.0, score)), 1)

    if score >= 7.0:
        depth = "Strong"
    elif score >= 4.0:
        depth = "Moderate"
    else:
        depth = "Weak"

    return {
        "score": score,
        "level": depth
    }

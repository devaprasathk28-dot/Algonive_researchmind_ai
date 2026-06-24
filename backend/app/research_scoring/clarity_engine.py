import textstat

def calculate_clarity(text: str, evidence: dict) -> dict:
    """
    Score the paper's clarity based on readability, structural sections, 
    presence of methodology explanations, and visual/table aids.
    """
    if not text or len(text.strip()) < 50:
        return {
            "score": 5.0,
            "evidence": ["Insufficient text content to perform clarity evaluation."]
        }

    # 1. Readability Score (out of 10)
    # Flesch reading ease: higher means easier to read.
    # Academic papers are typically low (10-30), which is normal. Let's scale it.
    try:
        flesch = textstat.flesch_reading_ease(text)
        # Scale Flesch reading ease so that academic-level readability gets a good score.
        # Flesch < 30 is "Very Difficult" (College graduate level). We score this highly for research.
        if flesch < 10:
            readability_score = 6.5 # Extremely dense
        elif flesch < 30:
            readability_score = 8.5 # High academic grade
        elif flesch < 50:
            readability_score = 9.0 # Good clarity
        else:
            readability_score = 7.5 # Very simple English (sometimes lacks academic rigor)
    except Exception:
        readability_score = 7.5

    # 2. Section Structure Score (out of 10)
    # Check if standard academic sections exist in text
    sections = ["introduction", "method", "experiment", "result", "discussion", "conclusion", "reference"]
    matched_sections = 0
    text_lower = text.lower()
    for s in sections:
        if s in text_lower:
            matched_sections += 1
            
    structure_score = min(2.0 + (matched_sections * 1.2), 10.0)

    # 3. Method Explanation Depth (out of 10)
    # Evaluated via presence of math equations or formulas
    eq_count = evidence.get("equations", 0)
    method_score = min(4.0 + (eq_count * 0.8), 10.0)

    # 4. Visual Aids Score (out of 10)
    # Figure and table references
    fig_refs = text_lower.count("figure") + text_lower.count("fig.")
    tbl_refs = text_lower.count("table")
    visuals_score = min(3.0 + (fig_refs * 0.5 + tbl_refs * 0.8), 10.0)

    # Combine clarity score
    clarity_score = (
        readability_score * 0.3 +
        structure_score * 0.3 +
        method_score * 0.2 +
        visuals_score * 0.2
    )
    clarity_score = round(max(1.0, min(10.0, clarity_score)), 1)

    # Generate reasons
    reasons = []
    if readability_score >= 8.0:
        reasons.append("Maintains an appropriate balance of academic vocabulary and reading flow.")
    else:
        reasons.append("The text density is extremely high and might require advanced domain knowledge.")
        
    if matched_sections >= 5:
        reasons.append("Well structured with standard academic subdivisions (Introduction, Methodology, Results).")
    else:
        reasons.append("Lacks conventional clear boundaries between paper subsections.")
        
    if eq_count > 0:
        reasons.append(f"Provides formal mathematical representations ({eq_count} equation notations detected).")
        
    if fig_refs + tbl_refs > 0:
        reasons.append(f"Supported by references to visual figures ({fig_refs}) and tabular metrics ({tbl_refs}).")
        
    return {
        "score": clarity_score,
        "evidence": reasons
    }

from app.research_scoring.evidence_extractor import extract_evidence
from app.research_scoring.novelty_engine import calculate_novelty
from app.research_scoring.clarity_engine import calculate_clarity
from app.research_scoring.innovation_engine import calculate_innovation
from app.research_scoring.reproducibility_engine import calculate_reproducibility
from app.research_scoring.methodology_engine import calculate_technical_quality, calculate_dataset_quality

def score_paper(text: str, entities: list = None, metrics: dict = None) -> dict:
    """
    Run evidence-based scoring on the research paper.
    Calculates detailed scores, explanations, overall health, and strengths/weaknesses.
    """
    # 1. Extract raw evidence signals
    evidence = extract_evidence(text, entities)
    
    # 2. Run individual grading engines
    novelty_res = calculate_novelty(text, evidence)
    clarity_res = calculate_clarity(text, evidence)
    innovation_res = calculate_innovation(text, evidence)
    reproducibility_res = calculate_reproducibility(text, evidence)
    technical_res = calculate_technical_quality(text, evidence)
    dataset_res = calculate_dataset_quality(text, evidence)
    
    # 3. Overall Research Health Score
    novelty = novelty_res["score"]
    innovation = innovation_res["score"]
    technical_quality = technical_res["score"]
    clarity = clarity_res["score"]
    reproducibility = reproducibility_res["score"]
    dataset_quality = dataset_res["score"]
    
    overall_score = (
        novelty +
        innovation +
        technical_quality +
        clarity +
        reproducibility +
        dataset_quality
    ) / 6.0
    overall_score = round(max(1.0, min(10.0, overall_score)), 1)
    
    # 4. Scoring Confidence Score (in %)
    # Calculated based on length of text, citation count, and evidence density.
    word_count = len(text.split()) if text else 0
    ref_weight = min(evidence.get("references", 0) * 1.5, 15.0)
    word_weight = min((word_count / 1000.0) * 5.0, 10.0)
    entity_weight = min((evidence.get("models", 0) + evidence.get("methods", 0)) * 2.0, 10.0)
    
    confidence_score = round(min(70.0 + ref_weight + word_weight + entity_weight, 98.0), 1)
    
    # 5. Dynamic Strengths & Weaknesses Generator
    strengths = []
    weaknesses = []
    
    # Analyze Novelty
    if novelty >= 8.0:
        strengths.append("High degree of theoretical or methodological novelty.")
    elif novelty <= 5.5:
        weaknesses.append("Presents incremental changes to standard architectures without major novelty.")
        
    # Analyze Clarity
    if clarity >= 8.0:
        strengths.append("Well structured document layout with clear academic reading flow.")
    elif clarity <= 5.5:
        weaknesses.append("Lacks conventional layout divisions or clear structural clarity.")
        
    # Analyze Technical Quality
    if technical_quality >= 8.0:
        strengths.append("High technical depth with multiple baseline models and validation trials.")
    elif technical_quality <= 5.5:
        weaknesses.append("Limited baseline benchmarks and experimental trials to validate claims.")
        
    # Analyze Reproducibility
    if evidence.get("has_code"):
        strengths.append("Excellent reproducibility due to available public code repository links.")
    else:
        weaknesses.append("Missing public code repository link, which limits direct reproducibility.")
        
    if evidence.get("equations", 0) >= 3:
        strengths.append("Provides detailed mathematical explanations and formal frameworks.")
    else:
        weaknesses.append("Lacks formal mathematical definitions or algorithm descriptions.")
        
    # Fallback to keep lists populated if needed
    if not strengths:
        strengths.append("Presents clear and standard experimental setups.")
    if not weaknesses:
        weaknesses.append("Could provide additional ablation studies or hyperparameter tuning details.")
        
    return {
        "novelty": novelty_res,
        "clarity": clarity_res,
        "innovation": innovation_res,
        "reproducibility": reproducibility_res,
        "technical_quality": technical_res,
        "dataset_quality": dataset_res,
        "overall_score": overall_score,
        "confidence_score": confidence_score,
        "strengths": strengths,
        "weaknesses": weaknesses
    }

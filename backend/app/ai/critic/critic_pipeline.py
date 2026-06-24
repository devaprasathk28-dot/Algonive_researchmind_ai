from app.ai.critic.strengths_analyzer import (
    analyze_strengths
)

from app.ai.critic.weaknesses_analyzer import (
    analyze_weaknesses
)

from app.ai.critic.novelty_checker import (
    evaluate_novelty
)

from app.ai.critic.reproducibility_checker import (
    evaluate_reproducibility
)

from app.ai.critic.bias_detector import (
    detect_biases
)

from app.ai.critic.dataset_evaluator import (
    evaluate_dataset_quality
)

from app.ai.critic.scientific_validator import (
    validate_scientific_quality
)

from app.ai.critic.scoring_engine import (
    generate_research_scores
)

def run_critic_pipeline(
    parsed_paper
):

    # -----------------------------------
    # Combine Sections
    # -----------------------------------

    full_text = ""

    for _, content in parsed_paper[
        "sections"
    ].items():

        full_text += (
            content + "\n"
        )

    # -----------------------------------
    # Strengths
    # -----------------------------------

    strengths = (
        analyze_strengths(
            full_text
        )
    )

    # -----------------------------------
    # Weaknesses
    # -----------------------------------

    weaknesses = (
        analyze_weaknesses(
            full_text
        )
    )

    # -----------------------------------
    # Novelty
    # -----------------------------------

    novelty = (
        evaluate_novelty(
            full_text
        )
    )

    # -----------------------------------
    # Reproducibility
    # -----------------------------------

    reproducibility = (
        evaluate_reproducibility(

            parsed_paper[
                "sections"
            ]
        )
    )

    # -----------------------------------
    # Bias Detection
    # -----------------------------------

    biases = (
        detect_biases(
            full_text
        )
    )

    # -----------------------------------
    # Dataset Evaluation
    # -----------------------------------

    dataset_quality = (
        evaluate_dataset_quality(
            full_text
        )
    )

    # -----------------------------------
    # Scientific Validation
    # -----------------------------------

    validation = (
        validate_scientific_quality(

            parsed_paper[
                "sections"
            ]
        )
    )

    # -----------------------------------
    # Scores & Explanations (Step 35 Upgrade)
    # -----------------------------------
    from app.research_scoring.scoring_pipeline import score_paper
    from app.research_scoring.score_explainer import explain_scores
    from app.entity_extraction.entity_pipeline import run_entity_pipeline

    entities = run_entity_pipeline(full_text)
    scoring_results = score_paper(full_text, entities=entities)
    scores_explained = explain_scores(scoring_results)

    scores = {
        "novelty": scoring_results["novelty"]["score"],
        "clarity": scoring_results["clarity"]["score"],
        "technical_depth": scoring_results["technical_quality"]["score"],
        "technical_quality": scoring_results["technical_quality"]["score"],
        "reproducibility": scoring_results["reproducibility"]["score"],
        "dataset_quality": scoring_results["dataset_quality"]["score"],
        "innovation": scoring_results["innovation"]["score"],
        "research_health": scoring_results["overall_score"]
    }

    return {
        "strengths": scoring_results["strengths"],
        "weaknesses": scoring_results["weaknesses"],
        "novelty_analysis": novelty,
        "reproducibility": reproducibility,
        "bias_analysis": biases,
        "dataset_quality": dataset_quality,
        "scientific_validation": validation,
        "research_scores": scores,
        "research_scores_explained": scores_explained
    }


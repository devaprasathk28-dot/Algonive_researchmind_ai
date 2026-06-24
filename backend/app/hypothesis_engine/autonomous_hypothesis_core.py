from app.hypothesis_engine.context_analyzer import (
    analyze_research_context
)

from app.hypothesis_engine.research_gap_detector import (
    detect_research_gaps
)

from app.hypothesis_engine.cross_domain_reasoner import (
    perform_cross_domain_reasoning
)

from app.hypothesis_engine.hypothesis_generator import (
    generate_scientific_hypotheses
)

from app.hypothesis_engine.validation_engine import (
    validate_hypotheses
)

from app.hypothesis_engine.proposal_generator import (
    generate_research_proposals
)

def execute_hypothesis_generation(
    research_text
):

    # -----------------------------------
    # Context Understanding
    # -----------------------------------

    context = analyze_research_context(
        research_text
    )

    # -----------------------------------
    # Gap Detection
    # -----------------------------------

    gaps = detect_research_gaps(
        context
    )

    # -----------------------------------
    # Cross-Domain Reasoning
    # -----------------------------------

    combinations = (
        perform_cross_domain_reasoning(

            context[
                "detected_topics"
            ]
        )
    )

    # -----------------------------------
    # Hypothesis Generation
    # -----------------------------------

    hypotheses = (
        generate_scientific_hypotheses(
            gaps,
            combinations
        )
    )

    # -----------------------------------
    # Hypothesis Validation
    # -----------------------------------

    validated = (
        validate_hypotheses(
            hypotheses
        )
    )

    # -----------------------------------
    # Proposal Generation
    # -----------------------------------

    proposals = (
        generate_research_proposals(
            validated
        )
    )

    return {

        "research_context":
            context,

        "detected_gaps":
            gaps,

        "cross_domain_combinations":
            combinations,

        "generated_hypotheses":
            hypotheses,

        "validated_hypotheses":
            validated,

        "research_proposals":
            proposals
    }

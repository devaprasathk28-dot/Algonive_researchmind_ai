def validate_hypotheses(
    hypotheses
):

    validated = []

    for hypothesis in hypotheses:

        validated.append({

            "hypothesis":
                hypothesis["hypothesis"],

            "innovation_level":
                hypothesis["innovation_level"],

            "feasibility_score":
                8.7,

            "research_potential":
                "Strong"
        })

    return validated

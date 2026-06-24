def generate_scientific_hypotheses(
    gaps,
    combinations
):

    hypotheses = []

    for gap in gaps:

        hypotheses.append({

            "hypothesis":
                f"AI systems addressing '{gap}' may significantly improve scientific automation.",

            "innovation_level":
                "High"
        })

    for combo in combinations:

        hypotheses.append({

            "hypothesis":
                f"Integrating {combo} could create next-generation autonomous research systems.",

            "innovation_level":
                "Very High"
        })

    return hypotheses

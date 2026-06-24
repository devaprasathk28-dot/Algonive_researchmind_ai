def predict_scientific_breakthroughs(
    simulations
):

    breakthroughs = []

    for simulation in simulations:

        breakthroughs.append({

            "domain":
                simulation["domain"],

            "predicted_breakthrough":
                f"Major innovation expected in {simulation['domain']}.",

            "breakthrough_confidence":
                0.91
        })

    return breakthroughs

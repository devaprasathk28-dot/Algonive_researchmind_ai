def generate_future_scenarios(
    breakthroughs
):

    scenarios = []

    for breakthrough in breakthroughs:

        scenarios.append({

            "future_scenario":
                f"AI systems powered by {breakthrough['domain']} could transform scientific automation.",

            "impact_level":
                "Very High"
        })

    return scenarios

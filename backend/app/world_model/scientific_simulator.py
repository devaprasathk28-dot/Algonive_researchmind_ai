def simulate_future_scientific_states(
    forecasts
):

    simulations = []

    for forecast in forecasts:

        simulations.append({

            "domain":
                forecast["domain"],

            "simulated_future_state":
                f"{forecast['domain']} may dominate next-generation AI research.",

            "probability":
                0.87
        })

    return simulations

evolution_history = []

def track_system_evolution(
    optimization_results
):

    evolution_record = {

        "cycle":
            len(evolution_history) + 1,

        "improvements":
            optimization_results,

        "evolution_status":
            "improved"
    }

    evolution_history.append(
        evolution_record
    )

    return evolution_record

def get_evolution_history():

    return evolution_history

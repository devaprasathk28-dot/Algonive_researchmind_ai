def optimize_reasoning_recursively(
    reflection
):

    optimizations = []

    for weakness in reflection[
        "identified_weaknesses"
    ]:

        optimizations.append({

            "weakness":
                weakness,

            "improvement":
                "Enhance causal scientific reasoning.",

            "optimization_status":
                "applied"
        })

    return optimizations

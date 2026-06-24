def execute_optimization_loop(
    adaptations
):

    optimization_results = []

    for adaptation in adaptations:

        optimization_results.append({

            "optimization":
                adaptation[
                    "adaptation"
                ],

            "improvement_gain":
                0.12
        })

    return optimization_results

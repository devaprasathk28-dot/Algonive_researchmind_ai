def optimize_architectures(
    evaluated_models
):

    optimized = []

    for model in evaluated_models:

        optimized_model = model.copy()

        optimized_model[
            "optimized_score"
        ] = round(

            (
                model["estimated_accuracy"]
                * 0.7
            ) +

            (
                model["estimated_efficiency"]
                * 0.3
            ),

            2
        )

        optimized.append(
            optimized_model
        )

    return optimized

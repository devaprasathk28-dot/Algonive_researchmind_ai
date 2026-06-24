def rank_architectures(
    optimized_models
):

    ranked = sorted(

        optimized_models,

        key=lambda x:
            x["optimized_score"],

        reverse=True
    )

    return ranked

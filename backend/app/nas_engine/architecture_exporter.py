def export_best_architecture(
    ranked_models
):

    best_model = ranked_models[0]

    architecture_summary = {

        "best_model":
            best_model[
                "architecture"
            ],

        "performance_score":
            best_model[
                "optimized_score"
            ],

        "deployment_status":
            "Ready for Training"
    }

    return architecture_summary

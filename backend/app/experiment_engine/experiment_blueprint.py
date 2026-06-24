def generate_experiment_blueprint(

    plan,
    datasets,
    models,
    training,
    evaluation,
    reproducibility
):

    blueprint = {

        "experiment_plan":
            plan,

        "datasets":
            datasets,

        "recommended_models":
            models,

        "training_strategy":
            training,

        "evaluation_pipeline":
            evaluation,

        "reproducibility":
            reproducibility
    }

    return blueprint

from app.experiment_engine.experiment_planner import (
    create_experiment_plan
)

from app.experiment_engine.dataset_selector import (
    select_experiment_datasets
)

from app.experiment_engine.model_selector import (
    recommend_models
)

from app.experiment_engine.training_strategy import (
    generate_training_strategy
)

from app.experiment_engine.evaluation_engine import (
    design_evaluation_pipeline
)

from app.experiment_engine.reproducibility_engine import (
    generate_reproducibility_checklist
)

from app.experiment_engine.experiment_blueprint import (
    generate_experiment_blueprint
)

def execute_experiment_design(
    research_goal
):

    # -----------------------------------
    # Experiment Planning
    # -----------------------------------

    plan = create_experiment_plan(
        research_goal
    )

    # -----------------------------------
    # Dataset Selection
    # -----------------------------------

    datasets = (
        select_experiment_datasets(
            research_goal
        )
    )

    # -----------------------------------
    # Model Recommendation
    # -----------------------------------

    models = recommend_models(
        research_goal
    )

    # -----------------------------------
    # Training Strategy
    # -----------------------------------

    training = (
        generate_training_strategy(
            models
        )
    )

    # -----------------------------------
    # Evaluation Pipeline
    # -----------------------------------

    evaluation = (
        design_evaluation_pipeline()
    )

    # -----------------------------------
    # Reproducibility
    # -----------------------------------

    reproducibility = (
        generate_reproducibility_checklist()
    )

    # -----------------------------------
    # Blueprint Generation
    # -----------------------------------

    blueprint = (
        generate_experiment_blueprint(

            plan,
            datasets,
            models,
            training,
            evaluation,
            reproducibility
        )
    )

    return blueprint

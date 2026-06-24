def create_experiment_plan(
    research_goal
):

    plan = {

        "research_goal":
            research_goal,

        "experiment_type":
            "AI Research Experiment",

        "planned_steps": [

            "dataset_selection",

            "model_selection",

            "training_configuration",

            "evaluation",

            "benchmark_analysis"
        ]
    }

    return plan

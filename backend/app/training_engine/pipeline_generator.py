def generate_training_pipeline():

    pipeline = {

        "stages": [

            "dataset_loading",

            "model_initialization",

            "training",

            "evaluation",

            "checkpointing",

            "deployment_preparation"
        ],

        "pipeline_status":
            "initialized"
    }

    return pipeline

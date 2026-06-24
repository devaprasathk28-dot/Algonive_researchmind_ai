def prepare_model_for_deployment():

    deployment = {

        "model_format":
            "TorchScript",

        "deployment_status":
            "ready",

        "optimization_level":
            "production"
    }

    return deployment

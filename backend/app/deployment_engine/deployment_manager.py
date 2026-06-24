def deploy_model_package(
    package
):

    deployment = {

        "deployment_id":
            "deploy_001",

        "model":
            package["model_name"],

        "deployment_status":
            "active"
    }

    return deployment

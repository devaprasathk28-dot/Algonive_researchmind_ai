model_versions = []

def register_model_version():

    version = {

        "version":
            f"v{len(model_versions)+1}",

        "status":
            "registered"
    }

    model_versions.append(
        version
    )

    return version

def get_registered_versions():

    return model_versions

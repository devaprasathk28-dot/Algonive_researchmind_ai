from app.deployment_engine.model_packager import (
    package_trained_model
)

from app.deployment_engine.deployment_manager import (
    deploy_model_package
)

from app.deployment_engine.version_manager import (
    register_model_version,
    get_registered_versions
)

from app.deployment_engine.scaling_engine import (
    enable_auto_scaling
)

from app.deployment_engine.monitoring_engine import (
    monitor_inference_performance
)

def execute_model_deployment():

    # -----------------------------------
    # Package Model
    # -----------------------------------

    package = (
        package_trained_model()
    )

    # -----------------------------------
    # Register Version
    # -----------------------------------

    version = (
        register_model_version()
    )

    # -----------------------------------
    # Deploy Model
    # -----------------------------------

    deployment = (
        deploy_model_package(
            package
        )
    )

    # -----------------------------------
    # Enable Scaling
    # -----------------------------------

    scaling = (
        enable_auto_scaling()
    )

    # -----------------------------------
    # Monitor Deployment
    # -----------------------------------

    monitoring = (
        monitor_inference_performance()
    )

    return {

        "model_package":
            package,

        "registered_version":
            version,

        "deployment":
            deployment,

        "registered_versions":
            get_registered_versions(),

        "scaling":
            scaling,

        "monitoring":
            monitoring
    }

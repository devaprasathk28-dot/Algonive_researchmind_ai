def enable_auto_scaling():

    scaling = {

        "scaling_mode":
            "automatic",

        "min_instances":
            1,

        "max_instances":
            10,

        "gpu_acceleration":
            True
    }

    return scaling

def generate_training_strategy(
    models
):

    strategies = []

    for model in models:

        strategies.append({

            "model":
                model,

            "epochs":
                50,

            "batch_size":
                32,

            "optimizer":
                "AdamW",

            "learning_rate":
                0.0001
        })

    return strategies

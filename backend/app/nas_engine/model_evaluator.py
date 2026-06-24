import random

def evaluate_architectures(
    architectures
):

    evaluated = []

    for architecture in architectures:

        evaluation = {

            "architecture":
                architecture,

            "estimated_accuracy":
                round(
                    random.uniform(
                        85,
                        99
                    ),
                    2
                ),

            "estimated_efficiency":
                round(
                    random.uniform(
                        70,
                        95
                    ),
                    2
                )
        }

        evaluated.append(
            evaluation
        )

    return evaluated

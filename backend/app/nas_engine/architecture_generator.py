import random

def generate_candidate_architectures(
    search_space,
    num_candidates=5
):

    architectures = []

    for index in range(
        num_candidates
    ):

        architecture = {

            "architecture_id":
                f"model_{index+1}",

            "layers":
                random.sample(

                    search_space["layers"],

                    3
                ),

            "activation":
                random.choice(

                    search_space["activations"]
                ),

            "optimizer":
                random.choice(

                    search_space["optimizers"]
                )
        }

        architectures.append(
            architecture
        )

    return architectures

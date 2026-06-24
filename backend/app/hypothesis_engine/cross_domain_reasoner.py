def perform_cross_domain_reasoning(
    topics
):

    combinations = []

    for i in range(len(topics)):

        for j in range(
            i + 1,
            len(topics)
        ):

            combinations.append(

                f"{topics[i]} + {topics[j]}"
            )

    return combinations

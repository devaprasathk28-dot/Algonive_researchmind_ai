def reflect_on_results(
    execution_results
):

    reflections = []

    for result in execution_results:

        reflections.append({

            "agent":
                result["agent"],

            "reflection":
                f"{result['agent']} completed successfully.",

            "quality_score":
                8.5
        })

    return reflections

def iterative_improvement(
    reflections
):

    improvements = []

    for reflection in reflections:

        if reflection["quality_score"] < 9:

            improvements.append({

                "agent":
                    reflection["agent"],

                "improvement":
                    "Increase reasoning depth."
            })

    return improvements

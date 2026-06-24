feedback_database = []

def collect_feedback(

    module_name,
    feedback_score,
    feedback_text
):

    feedback = {

        "module":
            module_name,

        "score":
            feedback_score,

        "feedback":
            feedback_text
    }

    feedback_database.append(
        feedback
    )

    return feedback

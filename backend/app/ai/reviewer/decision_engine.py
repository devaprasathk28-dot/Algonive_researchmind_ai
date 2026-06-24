def generate_final_decision(scores):

    average_score = sum(scores) / len(scores)

    if average_score >= 8:

        decision = "Accept"

        confidence = "High"

    elif average_score >= 6:

        decision = "Minor Revision"

        confidence = "Moderate"

    else:

        decision = "Reject"

        confidence = "Low"

    acceptance_probability = (
        average_score * 10
    )

    return {

        "final_decision":
            decision,

        "confidence":
            confidence,

        "acceptance_probability":
            f"{acceptance_probability}%"
    }

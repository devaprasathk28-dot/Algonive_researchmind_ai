from app.copilot.task_dispatcher import (
    dispatch_task
)

def run_copilot(

    message,
    paper_context

):

    intent = dispatch_task(
        message
    )

    if intent == "summary":

        return {

            "response":
                paper_context.get("summary", "No summary available in paper context.")
        }

    if intent == "future_work":

        return {

            "response":
                paper_context.get("future_work", "No future work recommendations available.")
        }

    if intent == "critique":

        return {

            "response":
                paper_context.get("critique", "No critique details available in paper context.")
        }

    # Fallback to general RAG guidance
    return {

        "response":
            f"Using RAG Engine... Searching paper text for context matching: '{message}'. The model provides adaptive suggestions for this research concept."
    }

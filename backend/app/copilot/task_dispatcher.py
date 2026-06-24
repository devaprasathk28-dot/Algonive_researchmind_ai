from app.copilot.intent_detector import (
    detect_intent
)

def dispatch_task(
    message
):

    intent = detect_intent(
        message
    )

    return intent

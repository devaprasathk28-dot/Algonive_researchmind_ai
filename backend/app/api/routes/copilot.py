from fastapi import APIRouter

from app.copilot.ai_copilot import (
    execute_ai_copilot
)

from app.copilot.copilot_engine import (
    run_copilot
)

router = APIRouter()

@router.post("/personal-ai-copilot")
def personal_ai_copilot(
    payload: dict
):

    query = payload["query"]

    user_history = (
        payload["user_history"]
    )

    results = execute_ai_copilot(

        query,
        user_history
    )

    return results

@router.post("/copilot")
def copilot(
    payload: dict
):

    return run_copilot(

        payload["message"],

        payload["paper_context"]
    )


from fastapi import APIRouter

from app.orchestrator.master_orchestrator import (
    execute_ai_workflow
)

router = APIRouter()

@router.post("/execute-ai-workflow")
def execute_workflow(
    payload: dict
):

    goal = payload["goal"]

    results = execute_ai_workflow(
        goal
    )

    return results

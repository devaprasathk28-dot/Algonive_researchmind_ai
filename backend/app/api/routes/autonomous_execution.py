from fastapi import APIRouter

from app.autonomous_execution.autonomous_core import (
    execute_autonomous_research
)

router = APIRouter()

@router.post("/autonomous-research-execution")
def autonomous_research_execution(
    payload: dict
):

    goal = payload["goal"]

    results = (
        execute_autonomous_research(
            goal
        )
    )

    return results

from fastapi import APIRouter

from app.agents.orchestrator import (
    execute_autonomous_research
)

router = APIRouter()

@router.post("/autonomous-research")
def autonomous_research(payload: dict):

    goal = payload["goal"]

    results = execute_autonomous_research(
        goal
    )

    return results

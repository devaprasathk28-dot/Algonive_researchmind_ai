from fastapi import APIRouter

from app.multi_agents.agent_orchestrator import (
    execute_multi_agent_workflow
)

router = APIRouter()

@router.post("/multi-agent-research")
def multi_agent_research(
    payload: dict
):

    text = payload["text"]

    results = (
        execute_multi_agent_workflow(
            text
        )
    )

    return results

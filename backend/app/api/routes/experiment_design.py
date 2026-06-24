from fastapi import APIRouter

from app.experiment_engine.autonomous_experiment_core import (
    execute_experiment_design
)

router = APIRouter()

@router.post("/design-ai-experiment")
def design_ai_experiment(
    payload: dict
):

    research_goal = (
        payload["research_goal"]
    )

    results = (
        execute_experiment_design(
            research_goal
        )
    )

    return results

from fastapi import APIRouter

from app.hypothesis_engine.autonomous_hypothesis_core import (
    execute_hypothesis_generation
)

router = APIRouter()

@router.post("/generate-ai-hypotheses")
def generate_ai_hypotheses(
    payload: dict
):

    research_text = (
        payload["research_text"]
    )

    results = (
        execute_hypothesis_generation(
            research_text
        )
    )

    return results

from fastapi import APIRouter

from app.agi_reasoning.multimodal_agi_core import (
    execute_multimodal_agi_reasoning
)

router = APIRouter()

@router.post("/multimodal-agi-reasoning")
def multimodal_agi_reasoning(
    payload: dict
):

    research_text = (
        payload["research_text"]
    )

    results = (
        execute_multimodal_agi_reasoning(
            research_text
        )
    )

    return results

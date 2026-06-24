from fastapi import APIRouter

from app.agi_director.agi_research_director_core import (
    execute_agi_research_director
)

router = APIRouter()

@router.post("/agi-research-director")
def agi_research_director(
    payload: dict
):

    objective = (
        payload["objective"]
    )

    results = (
        execute_agi_research_director(
            objective
        )
    )

    return results

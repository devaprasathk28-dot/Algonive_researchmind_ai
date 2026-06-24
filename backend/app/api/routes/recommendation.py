from fastapi import APIRouter

from app.recommendation_engine.live_recommender import (
    execute_live_recommendation
)

router = APIRouter()

@router.post("/live-recommendations")
def live_recommendations(
    payload: dict
):

    research_history = (
        payload["research_history"]
    )

    results = (
        execute_live_recommendation(
            research_history
        )
    )

    return results

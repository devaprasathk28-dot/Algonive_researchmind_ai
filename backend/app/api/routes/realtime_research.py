from fastapi import APIRouter

from app.realtime_research.realtime_tracker import (
    execute_realtime_tracking
)

router = APIRouter()

@router.post("/track-live-research")
def track_live_research(
    payload: dict
):

    query = payload["query"]

    results = execute_realtime_tracking(
        query
    )

    return results

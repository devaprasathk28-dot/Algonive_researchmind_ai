from fastapi import APIRouter

from app.ai.reviewer.conference_simulator import (
    simulate_peer_review
)

router = APIRouter()

@router.post("/simulate-peer-review")
def peer_review(payload: dict):

    text = payload["text"]

    results = simulate_peer_review(
        text
    )

    return results

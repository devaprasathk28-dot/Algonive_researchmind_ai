from fastapi import APIRouter

from app.alerts.live_alert_system import (
    execute_live_alert_system
)

router = APIRouter()

@router.post("/live-research-alerts")
def live_research_alerts(
    payload: dict
):

    query = payload["query"]

    results = execute_live_alert_system(
        query
    )

    return results

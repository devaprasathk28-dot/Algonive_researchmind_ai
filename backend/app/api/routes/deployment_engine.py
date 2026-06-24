from fastapi import APIRouter

from app.deployment_engine.deployment_core import (
    execute_model_deployment
)

router = APIRouter()

@router.post("/deploy-ai-model")
def deploy_ai_model():

    results = (
        execute_model_deployment()
    )

    return results

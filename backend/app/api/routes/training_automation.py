from fastapi import APIRouter

from app.training_engine.autonomous_training_core import (
    execute_autonomous_training
)

router = APIRouter()

@router.post("/autonomous-model-training")
def autonomous_model_training():

    results = (
        execute_autonomous_training()
    )

    return results

from fastapi import APIRouter

from app.world_model.world_model_core import (
    execute_scientific_world_model
)

router = APIRouter()

@router.post("/scientific-world-model")
def scientific_world_model():

    results = (
        execute_scientific_world_model()
    )

    return results

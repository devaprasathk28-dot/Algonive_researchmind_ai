from fastapi import APIRouter

from app.nas_engine.nas_core import (
    execute_neural_architecture_search
)

router = APIRouter()

@router.post("/neural-architecture-search")
def neural_architecture_search():

    results = (
        execute_neural_architecture_search()
    )

    return results

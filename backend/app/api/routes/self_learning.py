from fastapi import APIRouter

from app.self_learning.self_learning_core import (
    execute_self_learning_cycle
)

router = APIRouter()

@router.post("/execute-self-learning")
def execute_self_learning():

    results = (
        execute_self_learning_cycle()
    )

    return results

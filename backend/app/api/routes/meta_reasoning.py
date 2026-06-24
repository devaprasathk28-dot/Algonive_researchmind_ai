from fastapi import APIRouter

from app.meta_reasoning.meta_reasoning_core import (
    execute_meta_reasoning
)

router = APIRouter()

@router.post("/recursive-meta-reasoning")
def recursive_meta_reasoning():

    results = (
        execute_meta_reasoning()
    )

    return results

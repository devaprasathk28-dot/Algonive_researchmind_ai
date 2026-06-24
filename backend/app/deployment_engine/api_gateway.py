from fastapi import APIRouter

from app.deployment_engine.inference_engine import (
    perform_model_inference
)

router = APIRouter()

@router.post("/model-inference")
def model_inference(
    payload: dict
):

    input_text = (
        payload["input_text"]
    )

    prediction = (
        perform_model_inference(
            input_text
        )
    )

    return prediction

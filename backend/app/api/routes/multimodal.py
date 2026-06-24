from fastapi import (
    APIRouter,
    UploadFile,
    File
)
import os
from app.multimodal.multimodal_pipeline import (
    analyze_image
)

router = APIRouter()

UPLOAD_DIR = "app/uploads"

@router.post("/analyze-image")
async def analyze_uploaded_image(
    file: UploadFile = File(...)
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    image_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(
        image_path,
        "wb"
    ) as buffer:
        content = await file.read()
        buffer.write(content)

    results = analyze_image(
        image_path
    )
    return results

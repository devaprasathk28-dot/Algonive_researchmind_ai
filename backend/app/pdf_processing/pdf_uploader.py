import os
from fastapi import UploadFile

from app.core.storage import UPLOADS_DIR

UPLOAD_DIR = UPLOADS_DIR

async def save_uploaded_pdf(
    file: UploadFile
):
    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:
        content = await file.read()
        buffer.write(content)

    return file_path

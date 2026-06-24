from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    Request
)
from typing import Optional
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.crud import create_paper
from app.auth.dependencies import get_current_user_optional
from app.core.rate_limiter import limiter

from app.pdf_processing.pdf_uploader import (
    save_uploaded_pdf
)

from app.pdf_processing.pdf_pipeline import (
    process_pdf
)

router = APIRouter()

@router.post("/upload-paper")
@limiter.limit("5/minute")
async def upload_paper(
    request: Request,
    file: UploadFile = File(...),
    workspace_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    # -----------------------------
    # Save PDF
    # -----------------------------
    file_path = await save_uploaded_pdf(
        file
    )

    # -----------------------------
    # Process PDF
    # -----------------------------
    parsed_data = process_pdf(
        file_path,
        file.filename
    )

    # -----------------------------
    # Save to Database
    # -----------------------------
    authors = parsed_data.get("authors", [])
    authors_str = ", ".join(authors) if isinstance(authors, list) else str(authors)

    # Compile full text
    full_text = ""
    sections = parsed_data.get("sections")
    if sections and isinstance(sections, dict):
        for section_title, section_content in sections.items():
            full_text += f"{section_title}\n{section_content}\n\n"
    else:
        full_text = parsed_data.get("extracted_text") or parsed_data.get("abstract") or ""

    user_id = current_user.id if current_user else None

    db_paper = create_paper(
        db,
        title=parsed_data.get("title") or file.filename or "Untitled Paper",
        authors=authors_str or "Unknown",
        abstract=parsed_data.get("abstract") or "",
        full_text=full_text,
        summary="",
        critique="",
        user_id=user_id,
        workspace_id=workspace_id
    )

    # Register file metadata
    from app.library.library_pipeline import register_uploaded_file
    register_uploaded_file(
        db,
        paper_id=db_paper.id,
        file_path=file_path,
        file_name=file.filename
    )

    # Extract & save scientific entities
    from app.entity_extraction.entity_pipeline import save_paper_entities
    save_paper_entities(db, db_paper.id, full_text)

    parsed_data["id"] = db_paper.id


    return parsed_data



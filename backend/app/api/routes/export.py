from fastapi import APIRouter
from fastapi.responses import FileResponse
import os
from app.exports.report_builder import generate_all_reports as old_generate_all_reports
from app.export.export_pipeline import generate_all_reports

router = APIRouter(prefix="/export", tags=["export"])
new_router = APIRouter(tags=["export-new"])

@router.post("/reports")
def export_reports(payload: dict):
    title = payload.get("title", "Research Report")
    summary = payload.get("summary", "")
    critique = payload.get("critique", "")
    
    # Generate the reports
    # These will be created in the root of the backend folder
    old_generate_all_reports(title, summary, critique)
    
    return {
        "message": "Reports generated successfully",
        "reports": {
            "pdf": "/api/export/download/research_report.pdf",
            "docx": "/api/export/download/research_report.docx",
            "pptx": "/api/export/download/research_report.pptx"
        }
    }

@router.get("/download/{filename}")
def download_file(filename: str):
    valid_files = ["research_report.pdf", "research_report.docx", "research_report.pptx"]
    if filename not in valid_files:
        return {"error": "Access denied"}
        
    # The files are written to the current working directory of the backend server
    file_path = filename
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=filename, media_type="application/octet-stream")
    return {"error": f"File {filename} not found"}

@new_router.post("/generate-reports")
def generate_reports(report_data: dict):
    return generate_all_reports(report_data)


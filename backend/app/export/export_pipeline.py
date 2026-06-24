from pathlib import Path

from app.export.pdf_exporter import (
    generate_pdf_report
)

from app.export.docx_exporter import (
    generate_docx_report
)

from app.export.ppt_exporter import (
    generate_ppt_report
)

from app.core.storage import REPORTS_DIR

EXPORT_DIR = Path(REPORTS_DIR)

def generate_all_reports(

    report_data
):

    pdf_path = EXPORT_DIR / "report.pdf"

    docx_path = EXPORT_DIR / "report.docx"

    ppt_path = EXPORT_DIR / "report.pptx"

    generate_pdf_report(
        report_data,
        pdf_path
    )

    generate_docx_report(
        report_data,
        docx_path
    )

    generate_ppt_report(
        report_data,
        ppt_path
    )

    return {

        "pdf":
            f"storage/reports/report.pdf",

        "docx":
            f"storage/reports/report.docx",

        "ppt":
            f"storage/reports/report.pptx"
    }

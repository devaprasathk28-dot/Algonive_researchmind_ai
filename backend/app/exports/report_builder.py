from app.exports.pdf_export import (
    generate_pdf_report
)

from app.exports.docx_export import (
    generate_docx_report
)

from app.exports.ppt_export import (
    generate_ppt_report
)

def generate_all_reports(
    title,
    summary,
    critique
):

    pdf_path = generate_pdf_report(
        "research_report.pdf",
        title,
        summary,
        critique
    )

    docx_path = generate_docx_report(
        "research_report.docx",
        title,
        summary,
        critique
    )

    ppt_path = generate_ppt_report(
        "research_report.pptx",
        title,
        summary
    )

    return {

        "pdf_report": pdf_path,

        "docx_report": docx_path,

        "ppt_report": ppt_path
    }

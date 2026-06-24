from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)

from reportlab.lib.styles import (
    getSampleStyleSheet
)

def generate_pdf_report(

    report_data,
    output_path

):

    doc = SimpleDocTemplate(
        str(output_path)
    )

    styles = getSampleStyleSheet()

    content = []

    content.append(

        Paragraph(
            "ResearchMind AI Report",
            styles["Title"]
        )
    )

    content.append(
        Spacer(1, 20)
    )

    content.append(

        Paragraph(
            report_data["summary"],
            styles["BodyText"]
        )
    )

    doc.build(content)

    return output_path

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)

from reportlab.lib.styles import (
    getSampleStyleSheet
)

def generate_pdf_report(
    filename,
    title,
    summary,
    critique
):

    doc = SimpleDocTemplate(filename)

    styles = getSampleStyleSheet()

    content = []

    # -----------------------------
    # Title
    # -----------------------------

    content.append(
        Paragraph(
            f"<b>{title}</b>",
            styles["Title"]
        )
    )

    content.append(
        Spacer(1, 20)
    )

    # -----------------------------
    # Summary
    # -----------------------------

    content.append(
        Paragraph(
            "<b>AI Summary</b>",
            styles["Heading2"]
        )
    )

    content.append(
        Paragraph(
            summary,
            styles["BodyText"]
        )
    )

    content.append(
        Spacer(1, 20)
    )

    # -----------------------------
    # Critique
    # -----------------------------

    content.append(
        Paragraph(
            "<b>Research Critique</b>",
            styles["Heading2"]
        )
    )

    content.append(
        Paragraph(
            critique,
            styles["BodyText"]
        )
    )

    doc.build(content)

    return filename

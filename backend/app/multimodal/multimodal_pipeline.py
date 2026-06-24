from app.multimodal.ocr_engine import (
    extract_text_from_image
)

from app.multimodal.image_classifier import (
    classify_image_type
)

from app.multimodal.chart_detector import (
    analyze_chart
)

from app.multimodal.table_analyzer import (
    analyze_table
)

from app.multimodal.diagram_interpreter import (
    interpret_diagram
)

from app.multimodal.image_captioner import (
    generate_image_caption
)

def analyze_image(
    image_path
):
    # -----------------------------------
    # OCR
    # -----------------------------------
    extracted_text = (
        extract_text_from_image(
            image_path
        )
    )

    # -----------------------------------
    # Image Classification
    # -----------------------------------
    image_type = (
        classify_image_type(
            image_path
        )
    )

    # -----------------------------------
    # Chart Analysis
    # -----------------------------------
    chart_analysis = (
        analyze_chart(
            extracted_text
        )
    )

    # -----------------------------------
    # Table Analysis
    # -----------------------------------
    table_analysis = (
        analyze_table(
            extracted_text
        )
    )

    # -----------------------------------
    # Diagram Interpretation
    # -----------------------------------
    diagram_analysis = (
        interpret_diagram(
            extracted_text
        )
    )

    # -----------------------------------
    # Image Caption
    # -----------------------------------
    caption = (
        generate_image_caption(
            image_path
        )
    )

    return {
        "image_type":
            image_type,
        "ocr_text":
            extracted_text,
        "chart_analysis":
            chart_analysis,
        "table_analysis":
            table_analysis,
        "diagram_analysis":
            diagram_analysis,
        "caption":
            caption
    }

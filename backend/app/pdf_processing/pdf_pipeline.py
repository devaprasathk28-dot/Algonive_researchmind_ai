from app.pdf_processing.text_extractor import (
    extract_text_from_pdf
)

from app.pdf_processing.metadata_extractor import (
    extract_metadata
)

from app.pdf_processing.section_parser import (
    parse_sections
)

from app.pdf_processing.table_extractor import (
    extract_tables
)

from app.pdf_processing.image_extractor import (
    extract_images
)

def process_pdf(
    pdf_path,
    filename
):
    # -----------------------------------
    # Extract Raw Text
    # -----------------------------------
    raw_text = (
        extract_text_from_pdf(
            pdf_path
        )
    )

    # -----------------------------------
    # Metadata Extraction
    # -----------------------------------
    metadata = (
        extract_metadata(
            raw_text
        )
    )

    # -----------------------------------
    # Section Parsing
    # -----------------------------------
    sections = (
        parse_sections(
            raw_text
        )
    )

    # -----------------------------------
    # Table Extraction
    # -----------------------------------
    tables = (
        extract_tables(
            pdf_path
        )
    )

    # -----------------------------------
    # Image Extraction
    # -----------------------------------
    images = (
        extract_images(
            pdf_path
        )
    )

    return {
        "filename": filename,
        "title": metadata["title"],
        "authors": metadata["authors"],
        # Provide abstract for schemas compatibility
        "abstract": sections.get("abstract", "").strip(),
        "sections": sections,
        "tables": tables,
        "images": images,
        "extracted_tables": tables,
        "extracted_images": images
    }

import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_path):
    """
    Extract text from a PDF file.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        str: Extracted text from the PDF
    """
    doc = fitz.open(pdf_path)
    
    full_text = ""
    
    for page in doc:
        full_text += page.get_text()
    
    doc.close()
    
    return full_text


def extract_metadata_from_pdf(pdf_path):
    """
    Extract metadata from a PDF file.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        dict: Metadata including title, author, pages, etc.
    """
    doc = fitz.open(pdf_path)
    
    metadata = {
        "title": doc.metadata.get("title", "Unknown"),
        "author": doc.metadata.get("author", "Unknown"),
        "pages": doc.page_count,
        "creation_date": doc.metadata.get("creationDate", "Unknown"),
        "subject": doc.metadata.get("subject", "Unknown"),
    }
    
    doc.close()
    
    return metadata

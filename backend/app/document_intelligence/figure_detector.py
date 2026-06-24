import fitz
import os
import re

def detect_figures(pdf_path: str, text: str = None) -> int:
    """
    Detect figures count from PDF using fitz page.get_images() and fallback to regex matches in text.
    """
    if pdf_path and os.path.exists(pdf_path):
        try:
            doc = fitz.open(pdf_path)
            image_count = 0
            for page in doc:
                image_count += len(page.get_images())
            doc.close()
            if image_count > 0:
                return image_count
        except Exception as e:
            print(f"Warning: Failed to retrieve figure counts from {pdf_path}: {e}")

    # Fallback to figure captions in text
    if text:
        caption_patterns = [
            r"(?i)\bFigure\s+\d+\b",
            r"(?i)\bFig\.\s+\d+\b"
        ]
        figures = set()
        for pat in caption_patterns:
            matches = re.findall(pat, text)
            figures.update(matches)
        if figures:
            return len(figures)

    return 0

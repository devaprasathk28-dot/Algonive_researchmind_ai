import fitz
import os

def get_page_count(pdf_path: str) -> int:
    """
    Get the total page count from a PDF file using PyMuPDF (fitz).
    """
    if not pdf_path or not os.path.exists(pdf_path):
        return 0
    try:
        doc = fitz.open(pdf_path)
        count = len(doc)
        doc.close()
        return count
    except Exception as e:
        print(f"Warning: Failed to retrieve page count for {pdf_path}: {e}")
        return 0

def get_word_count(text: str) -> int:
    """
    Get the total word count from a text string.
    """
    if not text:
        return 0
    return len(text.split())

def calculate_reading_time(words: int) -> int:
    """
    Calculate estimated reading time in minutes based on average academic reading speed (200 wpm).
    """
    return max(1, round(words / 200))

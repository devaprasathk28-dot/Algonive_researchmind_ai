import os
import re

def detect_tables(pdf_path: str, text: str = None) -> int:
    """
    Detect tables count using pdfplumber page.find_tables(), falling back to regex caption matches in text.
    """
    if pdf_path and os.path.exists(pdf_path):
        try:
            import pdfplumber
            with pdfplumber.open(pdf_path) as pdf:
                table_count = 0
                for page in pdf.pages:
                    tables = page.find_tables()
                    table_count += len(tables)
                if table_count > 0:
                    return table_count
        except Exception as e:
            print(f"Warning: Failed to retrieve tables count using pdfplumber: {e}")

    # Fallback to regex caption matches
    if text:
        caption_patterns = [
            r"(?i)\bTable\s+\d+\b"
        ]
        tables = set()
        for pat in caption_patterns:
            matches = re.findall(pat, text)
            tables.update(matches)
        if tables:
            return len(tables)

    return 0

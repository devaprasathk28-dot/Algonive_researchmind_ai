def extract_metadata(
    raw_text
):
    lines = raw_text.split("\n")
    # Clean empty lines first to find actual first and second line content
    clean_lines = [l.strip() for l in lines if l.strip()]

    title = "Unknown Title"
    authors = []

    if len(clean_lines) > 0:
        title = clean_lines[0]
    
    if len(clean_lines) > 1:
        # Simple splitting heuristic for authors line
        authors = [a.strip() for a in clean_lines[1].split(",") if a.strip()]

    return {
        "title": title,
        "authors": authors
    }

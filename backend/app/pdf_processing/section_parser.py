import re

SECTION_HEADERS = [
    "abstract",
    "introduction",
    "methodology",
    "methods",
    "results",
    "discussion",
    "conclusion"
]

def parse_sections(
    raw_text
):
    sections = {}
    current_section = "unknown"
    sections[current_section] = ""

    for line in raw_text.split("\n"):
        normalized = line.strip().lower()
        
        # Check if the line matches any header with optional numbering/formatting prefixes (e.g. "1. Introduction")
        found_header = None
        for header in SECTION_HEADERS:
            # Matches optional number/dot/whitespace prefix followed by header name
            pattern = rf"^([0-9\.\s]*){header}$"
            if re.match(pattern, normalized):
                found_header = header
                break
        
        if found_header:
            current_section = found_header
            sections[current_section] = ""
        else:
            sections[current_section] += (
                line + "\n"
            )

    return sections

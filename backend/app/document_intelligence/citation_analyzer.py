import re

def extract_references(text: str) -> list[str]:
    """
    Search for reference sections (References, Bibliography, Works Cited) and count citations.
    """
    if not text:
        return []

    # Identify bibliography/reference sections
    patterns = [
        r"(?i)\bReferences\b(.*)",
        r"(?i)\bBibliography\b(.*)",
        r"(?i)\bWorks Cited\b(.*)"
    ]

    has_ref_header = False
    reference_content = ""
    for pattern in patterns:
        matches = re.findall(pattern, text, re.DOTALL)
        if matches:
            reference_content = matches[0]
            has_ref_header = True
            break

    if not has_ref_header:
        # If no specific references header found, fallback to counting unique inline bracket citations
        bracket_citations = re.findall(r"\[\d+\]", text)
        if bracket_citations:
            return list(set(bracket_citations))
        return []

    # Standard formats for individual references in the bibliography block
    citation_patterns = [
        r"\[\d+\]\s+[^\[\n]+",
        r"\b\d+\.\s+[A-Z][a-zA-Z\s,]+",
        r"\b[A-Z][a-zA-Z\s,]+\(\d{4}\)[^.\n]+\."
    ]

    all_citations = []
    for pat in citation_patterns:
        matches = re.findall(pat, reference_content)
        if matches:
            all_citations.extend(matches)

    # Deduplicate citations preserving order
    seen = set()
    unique_citations = []
    for cit in all_citations:
        cit_clean = cit.strip()
        if cit_clean.lower() not in seen:
            seen.add(cit_clean.lower())
            unique_citations.append(cit_clean)

    # Fallback to general bracket citations inside the bibliography block
    if not unique_citations:
        bracket_citations = re.findall(r"\[\d+\]", reference_content)
        if bracket_citations:
            return list(set(bracket_citations))

    return unique_citations

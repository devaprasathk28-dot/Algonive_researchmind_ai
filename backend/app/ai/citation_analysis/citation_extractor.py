import re

def extract_citations(text):

    citation_pattern = r'\[(\d+)\]'

    citations = re.findall(
        citation_pattern,
        text
    )

    unique_citations = list(
        dict.fromkeys(citations)
    )

    return unique_citations

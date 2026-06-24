import re
from typing import Dict, Optional


def extract_title(text: str) -> str:
    """
    Extract the title from research paper text.
    
    Args:
        text (str): The full text of the paper
        
    Returns:
        str: The extracted title
    """
    lines = text.split("\n")
    
    for line in lines:
        line = line.strip()
        
        # Title is typically one of the first non-empty lines with reasonable length
        if len(line) > 20 and len(line) < 300:
            return line
    
    return "Title not found"


def extract_authors(text: str) -> list:
    """
    Extract authors from the research paper text.
    
    Args:
        text (str): The full text of the paper
        
    Returns:
        list: List of author names
    """
    # Look for author patterns (usually near title)
    first_500_chars = text[:500]
    
    # Pattern for common author name formats
    author_pattern = r"(?:[A-Z][a-z]+\s+)+(?:[A-Z][a-z]+)"
    
    matches = re.findall(author_pattern, first_500_chars)
    
    authors = []
    for match in matches:
        # Filter out common non-author strings
        if match not in ["Abstract", "Introduction", "Author"]:
            authors.append(match.strip())
    
    return authors[:10] if authors else ["Authors not found"]


def extract_abstract(text: str) -> str:
    """
    Extract the abstract from research paper text.
    
    Args:
        text (str): The full text of the paper
        
    Returns:
        str: The extracted abstract
    """
    # Pattern to match abstract section
    abstract_pattern = r"(?i)abstract\s*[:\-]?\s*(.*?)(?=\n\n|introduction|keywords|1\.|background|methods)"
    
    match = re.search(abstract_pattern, text, re.DOTALL)
    
    if match:
        abstract_text = match.group(1).strip()
        # Clean up the text
        abstract_text = re.sub(r'\s+', ' ', abstract_text)
        return abstract_text[:1000] if len(abstract_text) > 1000 else abstract_text
    
    return "Abstract not found"


def extract_keywords(text: str) -> list:
    """
    Extract keywords from the research paper text.
    
    Args:
        text (str): The full text of the paper
        
    Returns:
        list: List of keywords
    """
    # Pattern to match keywords section
    keywords_pattern = r"(?i)keywords?\s*[:\-]?\s*(.*?)(?=\n|abstract|introduction)"
    
    match = re.search(keywords_pattern, text, re.DOTALL)
    
    if match:
        keywords_text = match.group(1).strip()
        # Split by common delimiters
        keywords = re.split(r'[,;]', keywords_text)
        keywords = [k.strip() for k in keywords if k.strip()]
        return keywords[:20]
    
    return []


def extract_sections(text: str) -> Dict[str, str]:
    """
    Extract major sections from research paper text.
    
    Args:
        text (str): The full text of the paper
        
    Returns:
        dict: Dictionary with section names as keys and content as values
    """
    sections = {}
    
    possible_sections = [
        "introduction",
        "related work",
        "background",
        "methodology",
        "methods",
        "approach",
        "results",
        "discussion",
        "conclusion",
        "conclusions",
        "future work",
        "references"
    ]
    
    text_lower = text.lower()
    
    for section in possible_sections:
        # Create pattern to find section and extract content until next section
        pattern = rf"\b{section}\b\s*[:\-]?\s*(.*?)(?=\n\n|\b(?:{'|'.join(possible_sections)})\b|\Z)"
        
        match = re.search(pattern, text_lower, re.DOTALL)
        
        if match:
            section_text = match.group(1).strip()
            # Clean up whitespace
            section_text = re.sub(r'\s+', ' ', section_text)
            # Limit section length
            sections[section] = section_text[:2000] if len(section_text) > 2000 else section_text
    
    return sections


def extract_references(text: str) -> list:
    """
    Extract references/citations from research paper text.
    
    Args:
        text (str): The full text of the paper
        
    Returns:
        list: List of references
    """
    # Find references section
    ref_pattern = r"(?i)references?\s*\n(.*?)(?:\Z|appendix)"
    
    match = re.search(ref_pattern, text, re.DOTALL)
    
    references = []
    
    if match:
        ref_text = match.group(1)
        # Split by common reference patterns
        ref_lines = ref_text.split('\n')
        
        for line in ref_lines:
            line = line.strip()
            if line and len(line) > 10:  # Skip very short lines
                references.append(line)
    
    return references[:50] if references else []  # Return top 50 references


def extract_doi(text: str) -> Optional[str]:
    """
    Extract DOI from research paper text.
    
    Args:
        text (str): The full text of the paper
        
    Returns:
        str: The DOI if found, None otherwise
    """
    # Pattern for DOI
    doi_pattern = r"(?:doi|DOI)\s*[:\-]?\s*(10\.\d+/\S+)"
    
    match = re.search(doi_pattern, text)
    
    if match:
        return match.group(1).rstrip('.,;')
    
    return None


def parse_paper(text: str) -> Dict:
    """
    Comprehensive paper parsing function that extracts all key information.
    
    Args:
        text (str): The full text of the paper
        
    Returns:
        dict: Structured data containing all extracted information
    """
    return {
        "title": extract_title(text),
        "authors": extract_authors(text),
        "abstract": extract_abstract(text),
        "keywords": extract_keywords(text),
        "sections": extract_sections(text),
        "references": extract_references(text),
        "doi": extract_doi(text),
        "word_count": len(text.split())
    }

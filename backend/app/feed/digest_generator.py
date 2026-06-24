import re
import datetime
from typing import List, Dict, Any

def extract_key_sentence(summary: str) -> str:
    """
    Extracts a key contribution or focus sentence from the paper's abstract/summary.
    Falls back to the first sentence if no marker is found.
    """
    if not summary:
        return "Focuses on exploring novel concepts and technical methodologies."
    
    # Basic sentence splitter
    sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', summary)
    
    contrib_markers = [
        "we propose", "we introduce", "this paper", "our model", 
        "in this work", "we present", "we develop", "we demonstrate",
        "aims to", "focuses on", "is designed to"
    ]
    
    for sentence in sentences:
        s_lower = sentence.lower()
        if any(marker in s_lower for marker in contrib_markers):
            # Clean and return
            cleaned = sentence.strip()
            # Ensure it ends with a period
            if cleaned and not cleaned.endswith(('.', '!', '?')):
                cleaned += '.'
            return cleaned
            
    # Fallback to the first sentence
    if sentences:
        first = sentences[0].strip()
        if first and not first.endswith(('.', '!', '?')):
            first += '.'
        return first
        
    return summary

def generate_daily_digest(papers: List[Dict[str, Any]]) -> str:
    """
    Constructs a beautifully formatted text report summary of the top 3 papers.
    """
    today_str = datetime.date.today().strftime("%B %d, %Y")
    
    digest = f"### Daily Research Digest — {today_str}\n\n"
    digest += "Here is your curated overview of today's most relevant advancements:\n\n"
    
    top_papers = papers[:3]
    if not top_papers:
        digest += "*No new papers detected in your feed today. Try adjusting your followed topics or authors!*"
        return digest
        
    for idx, paper in enumerate(top_papers, 1):
        title = paper.get("title", "Untitled Paper")
        summary = paper.get("summary", "")
        why_recommended = paper.get("why_recommended", "Recommended based on your profile.")
        key_focus = extract_key_sentence(summary)
        
        # Clean title (e.g. remove extra spaces or brackets)
        title = re.sub(r'\s+', ' ', title).strip()
        
        digest += f"**{idx}. {title}**\n"
        digest += f"- **Key Contribution**: {key_focus}\n"
        digest += f"- **Why You Should Read**: {why_recommended}\n\n"
        
    digest += "---\n*ResearchMind AI Daily Digest updates automatically as new papers are published on arXiv.*"
    return digest

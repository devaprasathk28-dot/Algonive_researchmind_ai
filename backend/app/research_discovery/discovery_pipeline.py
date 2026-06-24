from app.research_discovery.arxiv_service import search_papers
from app.research_discovery.paper_ranker import rank_papers
import urllib.request
import os

def discover_research(query: str, max_results: int = 10, sort_by: str = "relevance"):
    papers = search_papers(query, max_results=max_results, sort_by=sort_by)
    ranked = rank_papers(query, papers)
    return ranked

def download_arxiv_pdf(pdf_url: str, save_path: str):
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    req = urllib.request.Request(
        pdf_url, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    )
    with urllib.request.urlopen(req) as response:
        with open(save_path, 'wb') as f:
            f.write(response.read())
            
    return save_path

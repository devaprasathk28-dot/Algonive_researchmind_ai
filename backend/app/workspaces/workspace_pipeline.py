from sqlalchemy.orm import Session
from app.workspaces.workspace_crud import get_workspaces
import re

def classify_paper_workspace_suggestion(db: Session, user_id: int, parsed_paper: dict):
    """
    Analyzes the parsed paper (title, abstract, sections) and suggests which
    existing workspaces it might belong to based on overlap of words.
    """
    workspaces = get_workspaces(db, user_id)
    if not workspaces:
        return []
        
    title = parsed_paper.get("title", "").lower()
    abstract = parsed_paper.get("abstract", "").lower()
    sections = parsed_paper.get("sections", {})
    text_corpus = title + " " + abstract
    if isinstance(sections, dict):
        text_corpus += " " + " ".join([str(v) for v in sections.values()]).lower()
        
    suggestions = []
    
    # Common stop words to ignore
    stop_words = {"research", "project", "workspace", "paper", "study", "analysis", "system", "method", "model"}
    
    for workspace in workspaces:
        score = 0
        name = workspace.name.lower()
        desc = (workspace.description or "").lower()
        
        # Tokenize name and description keywords
        ws_words = set(re.findall(r'\w+', name + " " + desc))
        # Keep only meaningful words > 3 chars and not stop words
        ws_words = {w for w in ws_words if len(w) > 3 and w not in stop_words}
        
        # Check overlaps
        for word in ws_words:
            if word in text_corpus:
                score += 1
                
        # If score is > 0 or if the workspace name is explicitly mentioned in the text
        if score > 0 or name in text_corpus:
            suggestions.append({
                "workspace_id": workspace.id,
                "name": workspace.name,
                "match_score": max(score, 1)
            })
            
    # Sort suggestions by match_score descending
    suggestions.sort(key=lambda x: x["match_score"], reverse=True)
    return suggestions

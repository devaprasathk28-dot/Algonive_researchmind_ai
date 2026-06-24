from sqlalchemy.orm import Session
from app.models.paper import Paper
from app.memory.long_term_memory import save_long_term_memory
from app.memory.short_term_memory import add_recent_paper

def index_paper_into_memory(db: Session, paper: Paper):
    """
    Executes the memory indexing pipeline for a newly analyzed paper.
    Caches sections (summary, critique, future work) in relational and vector stores.
    """
    if not paper:
        return
        
    # 1. Update session short term memory
    add_recent_paper(paper.title)
    
    # 2. Index paper profile
    paper_text = f"Title: {paper.title}\nAuthors: {paper.authors or 'unknown'}\nAbstract: {paper.abstract or ''}"
    save_long_term_memory(db, memory_type="PAPER", content=paper_text, user_id=paper.user_id)
    
    # 3. Index summary
    if paper.summary:
        save_long_term_memory(db, memory_type="SUMMARY", content=f"Summary of '{paper.title}': {paper.summary}", user_id=paper.user_id)
        
    # 4. Index critique
    if paper.critique:
        save_long_term_memory(db, memory_type="CRITIQUE", content=f"Critique of '{paper.title}': {paper.critique}", user_id=paper.user_id)
        
    # 5. Index future work / gaps
    if paper.future_work:
        save_long_term_memory(db, memory_type="RESEARCH_GAP", content=f"Future work from '{paper.title}': {paper.future_work}", user_id=paper.user_id)

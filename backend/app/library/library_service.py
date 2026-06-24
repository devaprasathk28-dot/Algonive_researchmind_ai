from sqlalchemy.orm import Session
from typing import Optional
from app.library.library_crud import get_user_papers

def fetch_library(db: Session, user_id: int, workspace_id: Optional[int] = None):
    papers = get_user_papers(db, user_id, workspace_id)
    papers_list = []
    for paper in papers:
        analysis_data = None
        if paper.analysis_new:
            analysis_data = {
                "novelty": str(paper.analysis_new.novelty or 0.0),
                "clarity": str(paper.analysis_new.clarity or 0.0),
                "innovation": str(paper.analysis_new.innovation or 0.0),
                "technical_depth": str(paper.analysis_new.technical_depth or 0.0)
            }
        elif paper.analysis:
            analysis_data = {
                "novelty": str(paper.analysis.novelty or 0.0),
                "clarity": str(paper.analysis.clarity or 0.0),
                "innovation": str(paper.analysis.innovation or 0.0),
                "technical_depth": str(paper.analysis.technical_depth or 0.0)
            }

        papers_list.append({
            "id": paper.id,
            "title": paper.title,
            "authors": paper.authors,
            "abstract": paper.abstract,
            "summary": paper.summary,
            "critique": paper.critique,
            "created_at": str(paper.created_at),
            "status": paper.status or "completed",
            "file_path": paper.file_path,
            "report_path": paper.report_path,
            "analysis": analysis_data
        })

    return {
        "papers": papers_list
    }


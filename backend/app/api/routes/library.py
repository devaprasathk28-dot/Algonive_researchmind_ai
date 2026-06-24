from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.database.connection import get_db
from app.database import crud, schemas, models
from app.rag.chunking import create_text_chunks
from app.rag.vector_store import store_chunks
from app.auth.dependencies import get_current_user_optional

from app.library.library_service import fetch_library

router = APIRouter()

@router.get("/library", response_model=List[schemas.ResearchPaper])
def get_library_compatibility_route(
    workspace_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Retrieve papers. If logged in, only retrieve user's papers. Otherwise, return all papers.
    """
    from app.models.paper import Paper
    if current_user:
        query = db.query(Paper).filter(Paper.user_id == current_user.id)
        if workspace_id is not None:
            query = query.filter(Paper.workspace_id == workspace_id)
        return query.order_by(Paper.created_at.desc()).all()
    return db.query(Paper).all()

@router.get("/library/{user_id}")
def get_library(
    user_id: int,
    workspace_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve library papers for a specific user.
    """
    return fetch_library(db, user_id, workspace_id)

@router.delete("/library/{paper_id}")
def delete_library_paper_compatibility(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Compatibility delete endpoint.
    """
    paper = crud.get_paper(db, paper_id)
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper not found"
        )
        
    if current_user and paper.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this paper"
        )
        
    # Clean up files on disk
    from app.library.file_manager import delete_local_files
    delete_local_files(paper.file_path, paper.report_path)
    
    crud.delete_paper(db, paper_id)
    return {"message": "Paper deleted successfully", "id": paper_id}

@router.delete("/paper/{paper_id}")
def remove_paper(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Remove paper by ID.
    """
    paper = crud.get_paper(db, paper_id)
    if not paper:
        return {"success": False}
        
    if current_user and paper.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this paper"
        )
        
    # Clean up files on disk
    from app.library.file_manager import delete_local_files
    delete_local_files(paper.file_path, paper.report_path)
    
    success = crud.delete_paper(db, paper_id)
    return {"success": success}


@router.post("/library/load/{paper_id}")
def load_paper_to_workspace(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Load a paper from the database, verifying ownership first if logged in.
    Re-initialize its RAG indexing from stored full_text and reconstruct frontend session.
    """
    paper = crud.get_paper(db, paper_id)
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper not found"
        )
        
    if current_user and paper.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this paper"
        )

    # Re-index for RAG if full_text is available
    if paper.full_text:
        try:
            chunks = create_text_chunks(paper.full_text)
            store_chunks(chunks, paper.title or f"paper_{paper.id}")
        except Exception as e:
            print(f"Warning: Failed to re-index paper: {e}")

    # Reconstruct summary dict
    summary_data = {}
    if paper.summary:
        try:
            summary_data = json.loads(paper.summary)
        except Exception:
            summary_data = {
                "tldr": paper.summary,
                "beginner_summary": paper.summary,
                "key_contributions": []
            }
            
    # Reconstruct critique dict
    critique_data = {}
    if paper.critique:
        try:
            critique_data = json.loads(paper.critique)
        except Exception:
            critique_data = {
                "strengths": [],
                "weaknesses": [],
                "research_scores": {}
            }

    authors_list = [a.strip() for a in paper.authors.split(",")] if paper.authors else []

    # Map analysis scores
    scores_data = {}
    if paper.analysis_new:
        scores_data = {
            "novelty": float(paper.analysis_new.novelty or 0.0),
            "clarity": float(paper.analysis_new.clarity or 0.0),
            "innovation": float(paper.analysis_new.innovation or 0.0),
            "technical_quality": float(paper.analysis_new.technical_depth or 0.0),
            "technical_depth": float(paper.analysis_new.technical_depth or 0.0),
            "reproducibility": float(paper.analysis_new.reproducibility or 7.5),
            "dataset_quality": float(paper.analysis_new.dataset_quality or 8.0),
            "overall_score": (float(paper.analysis_new.novelty or 0.0) + 
                              float(paper.analysis_new.clarity or 0.0) + 
                              float(paper.analysis_new.innovation or 0.0) + 
                              float(paper.analysis_new.technical_depth or 0.0)) / 4.0,
            # Step 35 Extensions
            "novelty_score": float(paper.analysis_new.novelty_score or paper.analysis_new.novelty or 0.0),
            "novelty_reason": paper.analysis_new.novelty_reason or "",
            "clarity_score": float(paper.analysis_new.clarity_score or paper.analysis_new.clarity or 0.0),
            "clarity_reason": paper.analysis_new.clarity_reason or "",
            "innovation_score": float(paper.analysis_new.innovation_score or paper.analysis_new.innovation or 0.0),
            "innovation_reason": paper.analysis_new.innovation_reason or "",
            "technical_score": float(paper.analysis_new.technical_score or paper.analysis_new.technical_depth or 0.0),
            "technical_reason": paper.analysis_new.technical_reason or "",
            "reproducibility_score": float(paper.analysis_new.reproducibility_score or paper.analysis_new.reproducibility or 7.5),
            "reproducibility_reason": paper.analysis_new.reproducibility_reason or "",
            "dataset_quality_score": float(paper.analysis_new.dataset_quality_score or paper.analysis_new.dataset_quality or 8.0),
            "dataset_quality_reason": paper.analysis_new.dataset_quality_reason or "",
            "confidence_score": float(paper.analysis_new.confidence_score or 90.0)
        }
    elif paper.analysis:
        scores_data = {
            "novelty": float(paper.analysis.novelty or 0.0),
            "clarity": float(paper.analysis.clarity or 0.0),
            "innovation": float(paper.analysis.innovation or 0.0),
            "technical_quality": float(paper.analysis.technical_depth or 0.0),
            "technical_depth": float(paper.analysis.technical_depth or 0.0),
            "reproducibility": 7.5,
            "dataset_quality": 8.0,
            "overall_score": (float(paper.analysis.novelty or 0.0) + 
                              float(paper.analysis.clarity or 0.0) + 
                              float(paper.analysis.innovation or 0.0) + 
                              float(paper.analysis.technical_depth or 0.0)) / 4.0,
            # Fallback values
            "novelty_score": float(paper.analysis.novelty or 0.0),
            "novelty_reason": "",
            "clarity_score": float(paper.analysis.clarity or 0.0),
            "clarity_reason": "",
            "innovation_score": float(paper.analysis.innovation or 0.0),
            "innovation_reason": "",
            "technical_score": float(paper.analysis.technical_depth or 0.0),
            "technical_reason": "",
            "reproducibility_score": 7.5,
            "reproducibility_reason": "",
            "dataset_quality_score": 8.0,
            "dataset_quality_reason": "",
            "confidence_score": 85.0
        }
    else:
        scores_data = critique_data.get("research_scores", {})
        scores_data = {
            "novelty": float(scores_data.get("novelty", 8.0)),
            "clarity": float(scores_data.get("clarity", 8.0)),
            "innovation": float(scores_data.get("innovation", 8.0)),
            "technical_quality": float(scores_data.get("technical_quality", 8.0)),
            "technical_depth": float(scores_data.get("technical_depth", 8.0)),
            "reproducibility": float(scores_data.get("reproducibility", 7.5)),
            "dataset_quality": float(scores_data.get("dataset_quality", 8.0)),
            "overall_score": float(scores_data.get("overall_score", 8.0)),
            "novelty_score": float(scores_data.get("novelty", 8.0)),
            "novelty_reason": "",
            "clarity_score": float(scores_data.get("clarity", 8.0)),
            "clarity_reason": "",
            "innovation_score": float(scores_data.get("innovation", 8.0)),
            "innovation_reason": "",
            "technical_score": float(scores_data.get("technical_depth", 8.0)),
            "technical_reason": "",
            "reproducibility_score": float(scores_data.get("reproducibility", 7.5)),
            "reproducibility_reason": "",
            "dataset_quality_score": float(scores_data.get("dataset_quality", 8.0)),
            "dataset_quality_reason": "",
            "confidence_score": 80.0
        }

    # Synthesize research_scores_explained if missing
    if "research_scores_explained" not in critique_data:
        critique_data["research_scores_explained"] = {
            "novelty": {
                "score": scores_data.get("novelty_score"),
                "reason": scores_data.get("novelty_reason") or "Evaluated based on standard novelty indicators.",
                "confidence": scores_data.get("confidence_score")
            },
            "clarity": {
                "score": scores_data.get("clarity_score"),
                "reason": scores_data.get("clarity_reason") or "Evaluated based on readability and layout style.",
                "confidence": scores_data.get("confidence_score")
            },
            "innovation": {
                "score": scores_data.get("innovation_score"),
                "reason": scores_data.get("innovation_reason") or "Evaluated based on core contributions.",
                "confidence": scores_data.get("confidence_score")
            },
            "technical_quality": {
                "score": scores_data.get("technical_score"),
                "reason": scores_data.get("technical_reason") or "Evaluated based on experiment trials depth.",
                "confidence": scores_data.get("confidence_score")
            },
            "reproducibility": {
                "score": scores_data.get("reproducibility_score"),
                "reason": scores_data.get("reproducibility_reason") or "Evaluated based on hyperparameters availability.",
                "confidence": scores_data.get("confidence_score")
            },
            "dataset_quality": {
                "score": scores_data.get("dataset_quality_score"),
                "reason": scores_data.get("dataset_quality_reason") or "Evaluated based on benchmark diversity.",
                "confidence": scores_data.get("confidence_score")
            }
        }

    # Fetch classification
    classification_data = None
    if paper.classifications:
        db_class = paper.classifications[0]
        
        # Load scientific entities from DB for explanation and keywords
        db_entities = db.query(models.Entity).filter(models.Entity.paper_id == paper.id).all()
        sci_types = {"MODEL", "DATASET", "FRAMEWORK", "METHOD", "METRIC", "TASK"}
        explanation = [e.name for e in db_entities if e.entity_type.upper() in sci_types]
        keywords = [e.name for e in db_entities if e.entity_type not in ("GENERAL", "ORGANIZATION")]
        
        classification_data = {
            "category": db_class.category,
            "subCategory": db_class.sub_category,
            "domain": db_class.domain,
            "applicationArea": db_class.industry_relevance,
            "difficulty": db_class.complexity,
            "researchType": db_class.research_type or "Experimental Research",
            "confidence": db_class.confidence or 0.85,
            "explanation": explanation,
            "keywords": keywords
        }

    # Fetch recommendations
    recommendations_data = None
    if paper.recommendation_records:
        db_rec = paper.recommendation_records[0]
        try:
            recommendations_data = {
                "datasets": json.loads(db_rec.datasets),
                "models": json.loads(db_rec.models),
                "topics": json.loads(db_rec.topics),
                "research_gaps": [],
                "similar_papers": json.loads(db_rec.similar_papers)
            }
        except Exception:
            pass

    # Fetch futureWork
    future_work_data = None
    if paper.future_work:
        try:
            future_work_data = json.loads(paper.future_work)
        except Exception:
            pass

    # Load or generate metrics
    metrics_data = None
    if paper.analysis_new and paper.analysis_new.page_count is not None:
        metrics_data = {
            "pages": paper.analysis_new.page_count,
            "words": paper.analysis_new.word_count,
            "sections": len([s for s in paper.full_text.split("\n\n") if s.strip()]) if paper.full_text else 1,
            "figures": paper.analysis_new.figure_count or 0,
            "tables": paper.analysis_new.table_count or 0,
            "references": paper.analysis_new.reference_count or 0,
            "reading_time": paper.analysis_new.reading_time or 1,
            "equations": paper.analysis_new.equation_count or 0,
            "complexity": paper.classifications[0].complexity if paper.classifications else "Intermediate",
            "complexity_score": paper.analysis_new.complexity_score or 0.0,
            "technical_density": paper.analysis_new.technical_density or 0.0,
            "document_intelligence": paper.analysis_new.document_intelligence or 0.0,
            "research_health": paper.analysis_new.research_health or 8.0,
            "readability": "Advanced",
            "methodology": "Strong",
            "experimental_coverage": "Excellent" if (paper.analysis_new.figure_count or 0) + (paper.analysis_new.table_count or 0) >= 10 else "Moderate",
            "citation_coverage": "High" if (paper.analysis_new.reference_count or 0) >= 30 else "Moderate"
        }

    if not metrics_data:
        reconstructed_parsed_paper = {
            "id": paper.id,
            "title": paper.title or "",
            "authors": authors_list,
            "abstract": paper.abstract or "",
            "sections": {
                "abstract": paper.abstract or "",
                "full_text": paper.full_text or ""
            },
            "page_count": 0,
            "images": [],
            "tables": []
        }
        from app.document_intelligence.metrics_pipeline import run_metrics_pipeline
        result = run_metrics_pipeline(reconstructed_parsed_paper, pdf_path=paper.pdf_path or paper.file_path)
        metrics_data = {
            "pages": result["pages"],
            "words": result["words"],
            "sections": result["sections"],
            "figures": result["figures"],
            "tables": result["tables"],
            "references": result["references"],
            "reading_time": result["reading_time"],
            "equations": result["equations"],
            "complexity": result["complexity"],
            "complexity_score": result["complexity_score"],
            "technical_density": result["technical_density"],
            "document_intelligence": result["document_intelligence"],
            "research_health": result["research_health"],
            "readability": result["readability"],
            "methodology": result["methodology"],
            "experimental_coverage": result["experimental_coverage"],
            "citation_coverage": result["citation_coverage"]
        }

        # Persist metrics cache into DB
        try:
            db_analysis = paper.analysis_new
            if not db_analysis:
                db_analysis = models.Analysis(paper_id=paper.id)
                db.add(db_analysis)
            db_analysis.page_count = result["pages"]
            db_analysis.word_count = result["words"]
            db_analysis.reading_time = result["reading_time"]
            db_analysis.reference_count = result["references"]
            db_analysis.figure_count = result["figures"]
            db_analysis.table_count = result["tables"]
            db_analysis.equation_count = result["equations"]
            db_analysis.complexity_score = result["complexity_score"]
            db_analysis.technical_density = result["technical_density"]
            db_analysis.document_intelligence = result["document_intelligence"]
            db_analysis.research_health = result["research_health"]
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Warning: Failed to save on-the-fly metrics to DB: {e}")

    return {
        "id": paper.id,
        "title": paper.title,
        "authors": authors_list,
        "abstract": paper.abstract,
        "summary": summary_data,
        "critique": critique_data,
        "scores": scores_data,
        "filename": f"paper_{paper.id}.pdf",
        "sections": {
            "abstract": paper.abstract,
            "summary": summary_data.get("tldr") or paper.summary or ""
        },
        "classification": classification_data,
        "recommendations": recommendations_data,
        "futureWork": future_work_data,
        "metrics": metrics_data,
        "reportLinks": {
            "pdf": f"http://127.0.0.1:8000/api/library/report/{paper.id}/pdf",
            "docx": f"http://127.0.0.1:8000/api/library/report/{paper.id}/docx",
            "ppt": f"http://127.0.0.1:8000/api/library/report/{paper.id}/pptx"
        }
    }


@router.get("/library/report/{paper_id}/{format}")
def download_paper_report(
    paper_id: int,
    format: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    import os
    from fastapi.responses import FileResponse
    from app.export.pdf_exporter import generate_pdf_report
    from app.export.docx_exporter import generate_docx_report
    from app.export.ppt_exporter import generate_ppt_report

    paper = crud.get_paper(db, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
        
    if current_user and paper.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    summary_dict = {}
    if paper.summary:
        try:
            summary_dict = json.loads(paper.summary)
        except Exception:
            summary_dict = {"tldr": paper.summary, "key_contributions": []}
            
    critique_dict = {}
    if paper.critique:
        try:
            critique_dict = json.loads(paper.critique)
        except Exception:
            critique_dict = {"strengths": [], "weaknesses": []}

    scores = {}
    if paper.analysis:
        scores = {
            "novelty": paper.analysis.novelty,
            "clarity": paper.analysis.clarity,
            "innovation": paper.analysis.innovation,
            "technical_depth": paper.analysis.technical_depth
        }
    else:
        scores = critique_dict.get("research_scores", {})
        
    report_data = {
        "title": paper.title or "Research Report",
        "summary": summary_dict.get("tldr") or summary_dict.get("beginner_summary") or paper.abstract or "No summary available.",
        "key_contributions": summary_dict.get("key_contributions") or [],
        "strengths": [s.get("point") if isinstance(s, dict) else s for s in critique_dict.get("strengths", [])],
        "weaknesses": [w.get("point") if isinstance(w, dict) else w for w in critique_dict.get("weaknesses", [])],
        "research_scores": scores,
        "future_work": critique_dict.get("reproducibility", {}).get("suggestions", []) if isinstance(critique_dict.get("reproducibility"), dict) else "",
        "recommendations": critique_dict.get("reproducibility", {}).get("issues", []) if isinstance(critique_dict.get("reproducibility"), dict) else []
    }
    
    from app.core.storage import REPORTS_DIR
    filename = f"report_{paper_id}.{format}"
    file_path = os.path.join(REPORTS_DIR, filename)
    
    if format == "pdf":
        generate_pdf_report(report_data, file_path)
    elif format == "docx":
        generate_docx_report(report_data, file_path)
    elif format == "pptx" or format == "ppt":
        generate_ppt_report(report_data, file_path)
    else:
        raise HTTPException(status_code=400, detail="Invalid format")
        
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=filename, media_type="application/octet-stream")
    else:
        raise HTTPException(status_code=500, detail="Could not generate report")



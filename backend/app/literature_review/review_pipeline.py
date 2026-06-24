from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.models.paper import Paper
from app.literature_review.multi_paper_parser import parse_multiple_papers
from app.literature_review.paper_comparator import compare_papers
from app.literature_review.trend_analyzer import analyze_trends
from app.literature_review.consensus_detector import detect_consensus
from app.literature_review.contradiction_detector import detect_contradictions
from app.literature_review.gap_detector import detect_gaps
from app.literature_review.citation_mapper import generate_citation_map
from app.literature_review.literature_generator import generate_literature_review

def run_literature_review_pipeline(db: Session, paper_ids: List[int]) -> Dict[str, Any]:
    """
    Orchestrate the complete multi-paper research intelligence pipeline.
    """
    papers = db.query(Paper).filter(Paper.id.in_(paper_ids)).all()
    if not papers:
        return {
            "error": "No papers found with the provided IDs."
        }

    # 1. Parse & Consolidate Entities
    consolidated_entities = parse_multiple_papers(db, paper_ids)

    # 2. Analyze Trends
    trends = analyze_trends(consolidated_entities)

    # 3. Compare Papers
    comparison = compare_papers(db, paper_ids)

    # 4. Detect Consensus
    consensus = detect_consensus(consolidated_entities)

    # 5. Detect Contradictions
    contradictions = detect_contradictions(consolidated_entities, comparison["papers_comparison"])

    # 6. Detect Gaps
    gaps = detect_gaps(consolidated_entities)

    # 7. Generate Citation Map
    citation_map = generate_citation_map(db, papers)

    # 8. Generate Literature Review Report & Score
    review_report = generate_literature_review(
        db,
        papers,
        consensus,
        contradictions,
        gaps,
        comparison
    )

    return {
        "collection_metadata": {
            "paper_ids": paper_ids,
            "total_papers": len(papers),
            "paper_titles": [p.title for p in papers]
        },
        "entities": consolidated_entities,
        "trends": trends,
        "comparison": comparison,
        "consensus": consensus,
        "contradictions": contradictions,
        "gaps": gaps,
        "citation_map": citation_map,
        "review": review_report
    }

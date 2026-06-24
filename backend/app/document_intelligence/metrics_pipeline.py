import re
from app.document_intelligence.document_metrics import get_page_count, get_word_count, calculate_reading_time
from app.document_intelligence.citation_analyzer import extract_references
from app.document_intelligence.figure_detector import detect_figures
from app.document_intelligence.table_detector import detect_tables
from app.document_intelligence.readability_engine import analyze_readability
from app.document_intelligence.methodology_analyzer import analyze_methodology
from app.document_intelligence.complexity_engine import calculate_complexity

def run_metrics_pipeline(parsed_paper: dict, pdf_path: str = None) -> dict:
    """
    Run document intelligence pipeline to calculate physical, readability, citations, and complexity metrics.
    """
    # 1. Compile raw text from parsed paper sections
    full_text = ""
    sections = parsed_paper.get("sections", {})
    if isinstance(sections, dict):
        for content in sections.values():
            full_text += content + "\n"
    else:
        full_text = parsed_paper.get("extracted_text") or parsed_paper.get("abstract") or ""

    if not full_text.strip():
        full_text = parsed_paper.get("title", "") + " " + parsed_paper.get("abstract", "")

    # 2. Page & Word counts
    page_count = get_page_count(pdf_path)
    if page_count == 0:
        page_count = parsed_paper.get("page_count") or parsed_paper.get("pages") or 0

    words = get_word_count(full_text)
    
    if page_count == 0:
        # Heuristic page count based on academic word density (~450 words/page)
        page_count = max(1, round(words / 450))

    reading_time = calculate_reading_time(words)
    section_count = len(sections) if isinstance(sections, dict) else 1

    # 3. Citations & References
    citations_list = extract_references(full_text)
    reference_count = len(citations_list)
    if reference_count == 0:
        ref_val = parsed_paper.get("references")
        if isinstance(ref_val, int):
            reference_count = ref_val

    # 4. Figures & Tables
    import os
    figure_count = 0
    if pdf_path and os.path.exists(pdf_path):
        figure_count = detect_figures(pdf_path, full_text)
    if figure_count == 0:
        images_val = parsed_paper.get("images")
        if isinstance(images_val, list):
            figure_count = len(images_val)
        elif isinstance(images_val, int):
            figure_count = images_val
    if figure_count == 0:
        figure_count = detect_figures(None, full_text)

    table_count = 0
    if pdf_path and os.path.exists(pdf_path):
        table_count = detect_tables(pdf_path, full_text)
    if table_count == 0:
        tables_val = parsed_paper.get("tables")
        if isinstance(tables_val, list):
            table_count = len(tables_val)
        elif isinstance(tables_val, int):
            table_count = tables_val
    if table_count == 0:
        table_count = detect_tables(None, full_text)

    # 5. Equation counts (match operators and Greek symbols)
    equation_patterns = [
        r'=', r'\+', r'-', r'\*', r'/', r'\^', r'∑', r'∫', r'∏', r'√', r'π', r'θ', r'λ', r'μ', r'σ', r'δ', r'ε', r'α', r'β', r'γ'
    ]
    raw_eq_operators = sum(full_text.count(op) for op in equation_patterns)
    equation_count = max(0, round(raw_eq_operators / 15.0))  # Scale raw operator counts down

    # 6. Readability & Methodology analysis
    readability_res = analyze_readability(full_text)
    methodology_res = analyze_methodology(full_text)

    # 7. Technical terms density
    entities = parsed_paper.get("entities", [])
    if not entities and parsed_paper.get("id"):
        try:
            from app.database.connection import SessionLocal
            from app.database import models
            with SessionLocal() as db:
                db_entities = db.query(models.Entity).filter(models.Entity.paper_id == int(parsed_paper["id"])).all()
                entities = [{"text": e.name, "type": e.entity_type} for e in db_entities]
        except Exception:
            pass

    sci_types = {"MODEL", "DATASET", "FRAMEWORK", "METHOD", "METRIC", "TASK"}
    technical_terms_count = sum(1 for e in entities if e.get("type", e.get("label", "")).upper() in sci_types)
    technical_density = technical_terms_count / max(1, words)

    # 8. Compute Complexity
    eq_density = equation_count / max(1, page_count)
    cit_density = reference_count / max(1, page_count)
    
    complexity_res = calculate_complexity(
        equation_density=eq_density,
        technical_density=technical_density,
        method_count=methodology_res["score"],
        entity_count=len(entities),
        citation_density=cit_density
    )

    # 9. Document Intelligence Score calculation (scale of 10)
    complexity_score = complexity_res["score"]
    readability_score = 10.0 if readability_res["level"] == "Advanced" else (7.0 if readability_res["level"] == "Intermediate" else 4.0)
    methodology_score = methodology_res["score"]
    citations_score = min(reference_count / 5.0, 10.0)
    tech_density_score = min(technical_density * 200.0, 10.0)

    document_intelligence = (
        complexity_score +
        readability_score +
        methodology_score +
        citations_score +
        tech_density_score
    ) / 5.0
    document_intelligence = round(max(1.0, min(10.0, document_intelligence)), 1)

    # 10. Research Health Score
    novelty = float(parsed_paper.get("novelty") or 8.0)
    clarity = float(parsed_paper.get("clarity") or 8.0)
    research_health = (
        novelty * 0.2 +
        clarity * 0.2 +
        citations_score * 0.2 +
        methodology_score * 0.2 +
        complexity_score * 0.2
    )
    research_health = round(max(1.0, min(10.0, research_health)), 1)

    return {
        "pages": page_count,
        "words": words,
        "sections": section_count,
        "figures": figure_count,
        "tables": table_count,
        "references": reference_count,
        "reading_time": reading_time,
        "readingTime": reading_time,
        "equations": equation_count,
        "complexity": complexity_res["level"],
        "complexity_score": complexity_score,
        "technical_density": round(technical_density, 4),
        "document_intelligence": document_intelligence,
        "research_health": research_health,
        "readability": readability_res["level"],
        "methodology": methodology_res["level"],
        "experimental_coverage": "Excellent" if figure_count + table_count >= 10 else ("Moderate" if figure_count + table_count >= 4 else "Basic"),
        "citation_coverage": "High" if reference_count >= 30 else ("Moderate" if reference_count >= 10 else "Low")
    }

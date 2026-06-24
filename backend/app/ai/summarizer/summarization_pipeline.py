from app.ai.summarizer.tl_dr_generator import (
    generate_tldr
)

from app.ai.summarizer.section_summarizer import (
    summarize_sections
)

from app.ai.summarizer.contribution_extractor import (
    extract_key_contributions
)

def run_summarization_pipeline(
    parsed_paper
):
    # -----------------------------------
    # Combine Sections
    # -----------------------------------
    sections_map = parsed_paper.get("sections", {})
    combined_text = ""
    
    # Prioritize standard academic sections over 'unknown' metadata page
    standard_sections = ["abstract", "introduction", "methodology", "methods", "results", "discussion", "conclusion"]
    has_standard = any(sec in sections_map and sections_map[sec].strip() for sec in standard_sections)
    
    if has_standard:
        for sec in standard_sections:
            if sec in sections_map and sections_map[sec].strip():
                combined_text += sections_map[sec] + "\n"
    else:
        combined_text = sections_map.get("unknown", "")


    # -----------------------------------
    # TLDR
    # -----------------------------------
    tldr = generate_tldr(
        combined_text[:5000]
    )

    # -----------------------------------
    # Section Summaries
    # -----------------------------------
    section_summaries = (
        summarize_sections(
            parsed_paper[
                "sections"
            ]
        )
    )

    # -----------------------------------
    # Key Contributions
    # -----------------------------------
    contributions = (
        extract_key_contributions(
            combined_text[:5000]
        )
    )

    return {
        "tldr":
            tldr,
        "section_summaries":
            section_summaries,
        "key_contributions":
            contributions
    }

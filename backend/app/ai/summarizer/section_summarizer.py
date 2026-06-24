from app.ai.summarizer.summarizer_model import (
    generate_summary
)

def summarize_sections(
    sections
):
    summarized_sections = {}

    for section_name, content in sections.items():
        if len(content.strip()) < 50:
            continue

        prompt = f"""
        Summarize this section from a research paper:

        {content[:3000]}
        """

        summarized_sections[
            section_name
        ] = generate_summary(
            prompt
        )

    return summarized_sections

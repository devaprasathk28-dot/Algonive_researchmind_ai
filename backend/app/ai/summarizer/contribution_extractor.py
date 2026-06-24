import re
from app.ai.summarizer.summarizer_model import (
    generate_summary
)

def extract_key_contributions(
    text
):
    prompt = f"""
    Extract the key contributions of this research paper as bullet points:

    {text[:4000]}
    """

    res = generate_summary(
        prompt
    )

    contributions = []
    for line in res.split("\n"):
        line = line.strip()
        if not line:
            continue
        # Remove common bullet prefixes
        cleaned = re.sub(r'^[\-\*\•\s\d\.]+', '', line).strip()
        if cleaned:
            words = cleaned.split()
            if len(words) > 0:
                # Filter out repetitive outputs (e.g. "APPENDIX APPENDIX")
                unique_ratio = len(set(words)) / len(words)
                if unique_ratio < 0.4:
                    continue
            contributions.append(cleaned)

    # Fallback if too few elements are extracted
    if len(contributions) < 2:
        from app.ai.summarizer.summarizer_engine import extract_key_contributions as fallback_extract
        return fallback_extract(text)

    return contributions


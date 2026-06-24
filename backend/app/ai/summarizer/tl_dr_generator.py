from app.ai.summarizer.summarizer_model import (
    generate_summary
)

def generate_tldr(
    text
):
    prompt = f"""
    Summarize this research paper in 5 concise sentences:

    {text}
    """

    return generate_summary(
        prompt
    )

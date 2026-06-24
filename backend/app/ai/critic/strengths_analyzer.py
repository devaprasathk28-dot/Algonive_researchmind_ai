from app.ai.critic.critic_model import (
    generate_critique
)

def analyze_strengths(
    paper_text
):

    prompt = f"""

    Analyze the strengths
    of this research paper.

    Focus on:

    - methodology
    - innovation
    - technical quality
    - experiments
    - clarity

    Paper:

    {paper_text[:4000]}
    """

    return generate_critique(
        prompt
    )

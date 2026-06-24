from app.ai.critic.critic_model import (
    generate_critique
)

def analyze_weaknesses(
    paper_text
):

    prompt = f"""

    Analyze the weaknesses
    and limitations
    of this research paper.

    Focus on:

    - insufficient experiments
    - weak evaluation
    - dataset limitations
    - scalability issues
    - reproducibility concerns

    Paper:

    {paper_text[:4000]}
    """

    return generate_critique(
        prompt
    )

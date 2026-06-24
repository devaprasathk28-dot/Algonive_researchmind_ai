from app.ai.critic.critic_model import (
    generate_critique
)

def evaluate_novelty(
    paper_text
):

    prompt = f"""

    Evaluate the novelty
    of this research paper.

    Determine:

    - originality
    - innovation
    - uniqueness
    - contribution significance

    Paper:

    {paper_text[:4000]}
    """

    return generate_critique(
        prompt
    )

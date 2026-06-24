from app.ai.reviewer.novelty_reviewer import (
    review_novelty
)

from app.ai.reviewer.methodology_reviewer import (
    review_methodology
)

from app.ai.reviewer.dataset_reviewer import (
    review_dataset_quality
)

from app.ai.reviewer.writing_reviewer import (
    review_writing_quality
)

from app.ai.reviewer.decision_engine import (
    generate_final_decision
)

def simulate_peer_review(text):

    novelty_review = review_novelty(text)

    methodology_review = (
        review_methodology(text)
    )

    dataset_review = (
        review_dataset_quality(text)
    )

    writing_review = (
        review_writing_quality(text)
    )

    scores = [

        novelty_review["novelty_score"],

        methodology_review["methodology_score"],

        dataset_review["dataset_score"],

        writing_review["writing_score"]
    ]

    final_decision = (
        generate_final_decision(scores)
    )

    return {

        "novelty_review":
            novelty_review,

        "methodology_review":
            methodology_review,

        "dataset_review":
            dataset_review,

        "writing_review":
            writing_review,

        "final_decision":
            final_decision
    }

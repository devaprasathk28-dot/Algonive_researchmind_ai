from app.copilot.user_profiler import (
    build_user_profile
)

from app.copilot.interest_learner import (
    learn_user_interests
)

from app.copilot.context_engine import (
    build_contextual_understanding
)

from app.copilot.guidance_engine import (
    generate_research_guidance
)

from app.copilot.recommendation_engine import (
    generate_personalized_recommendations
)

from app.copilot.adaptive_reasoner import (
    adaptive_reasoning_engine
)

def execute_ai_copilot(
    query,
    user_history
):

    # -----------------------------------
    # User Profiling
    # -----------------------------------

    profile = build_user_profile(
        user_history
    )

    # -----------------------------------
    # Interest Learning
    # -----------------------------------

    learning_model = (
        learn_user_interests(
            profile
        )
    )

    # -----------------------------------
    # Context Understanding
    # -----------------------------------

    context = (
        build_contextual_understanding(
            query
        )
    )

    # -----------------------------------
    # Personalized Guidance
    # -----------------------------------

    guidance = (
        generate_research_guidance(
            profile[
                "research_interests"
            ]
        )
    )

    # -----------------------------------
    # Personalized Recommendations
    # -----------------------------------

    recommendations = (
        generate_personalized_recommendations(
            profile[
                "research_interests"
            ]
        )
    )

    # -----------------------------------
    # Adaptive Reasoning
    # -----------------------------------

    reasoning = (
        adaptive_reasoning_engine(
            query,
            profile
        )
    )

    return {

        "user_profile":
            profile,

        "interest_learning":
            learning_model,

        "context":
            context,

        "guidance":
            guidance,

        "recommendations":
            recommendations,

        "adaptive_reasoning":
            reasoning
    }

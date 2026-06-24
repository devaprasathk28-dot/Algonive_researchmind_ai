from app.nas_engine.search_space import (
    generate_search_space
)

from app.nas_engine.architecture_generator import (
    generate_candidate_architectures
)

from app.nas_engine.model_evaluator import (
    evaluate_architectures
)

from app.nas_engine.optimization_engine import (
    optimize_architectures
)

from app.nas_engine.ranking_engine import (
    rank_architectures
)

from app.nas_engine.architecture_exporter import (
    export_best_architecture
)

def execute_neural_architecture_search():

    # -----------------------------------
    # Generate Search Space
    # -----------------------------------

    search_space = (
        generate_search_space()
    )

    # -----------------------------------
    # Generate Architectures
    # -----------------------------------

    architectures = (
        generate_candidate_architectures(
            search_space
        )
    )

    # -----------------------------------
    # Evaluate Architectures
    # -----------------------------------

    evaluated = (
        evaluate_architectures(
            architectures
        )
    )

    # -----------------------------------
    # Optimize Architectures
    # -----------------------------------

    optimized = (
        optimize_architectures(
            evaluated
        )
    )

    # -----------------------------------
    # Rank Architectures
    # -----------------------------------

    ranked = rank_architectures(
        optimized
    )

    # -----------------------------------
    # Export Best Architecture
    # -----------------------------------

    best_model = (
        export_best_architecture(
            ranked
        )
    )

    return {

        "search_space":
            search_space,

        "candidate_architectures":
            architectures,

        "evaluated_models":
            evaluated,

        "optimized_models":
            optimized,

        "ranked_models":
            ranked,

        "best_architecture":
            best_model
    }

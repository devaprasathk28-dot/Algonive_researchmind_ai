from fastapi import APIRouter

from app.ai.benchmarking.metric_extractor import (
    extract_performance_metrics
)

from app.ai.benchmarking.dataset_detector import (
    detect_benchmark_datasets
)

from app.ai.benchmarking.comparator import (
    compare_with_sota
)

from app.ai.benchmarking.ranking_engine import (
    rank_research_performance
)

from app.ai.benchmarking.competitiveness_analyzer import (
    analyze_competitiveness
)

router = APIRouter()

@router.post("/benchmark-research")
def benchmark_research_paper(
    payload: dict
):

    text = payload["text"]

    # ---------------------------------
    # Metric Extraction
    # ---------------------------------

    metrics = (
        extract_performance_metrics(
            text
        )
    )

    # ---------------------------------
    # Dataset Detection
    # ---------------------------------

    datasets = (
        detect_benchmark_datasets(
            text
        )
    )

    # ---------------------------------
    # SOTA Comparison
    # ---------------------------------

    comparisons = (
        compare_with_sota(
            datasets,
            metrics
        )
    )

    # ---------------------------------
    # Ranking
    # ---------------------------------

    rankings = (
        rank_research_performance(
            comparisons
        )
    )

    # ---------------------------------
    # Competitiveness Analysis
    # ---------------------------------

    competitiveness = (
        analyze_competitiveness(
            rankings
        )
    )

    return {

        "detected_datasets":
            datasets,

        "performance_metrics":
            metrics,

        "sota_comparisons":
            comparisons,

        "rankings":
            rankings,

        "competitiveness_analysis":
            competitiveness
    }

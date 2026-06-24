from fastapi import APIRouter

from app.ai.dataset_discovery.domain_detector import (
    detect_research_domain
)

from app.ai.dataset_discovery.dataset_matcher import (
    recommend_datasets
)

from app.ai.dataset_discovery.benchmark_recommender import (
    recommend_benchmark_datasets
)

from app.ai.dataset_discovery.dataset_analyzer import (
    analyze_dataset_suitability
)

router = APIRouter()

@router.post("/discover-datasets")
def discover_research_datasets(
    payload: dict
):

    text = payload["text"]

    # ---------------------------------
    # Domain Detection
    # ---------------------------------

    domain = detect_research_domain(
        text
    )

    # ---------------------------------
    # Dataset Recommendation
    # ---------------------------------

    datasets = recommend_datasets(
        domain
    )

    # ---------------------------------
    # Benchmark Recommendation
    # ---------------------------------

    benchmarks = (
        recommend_benchmark_datasets(
            datasets
        )
    )

    # ---------------------------------
    # Dataset Analysis
    # ---------------------------------

    suitability_analysis = (
        analyze_dataset_suitability(
            datasets
        )
    )

    return {

        "detected_domain":
            domain,

        "recommended_datasets":
            datasets,

        "benchmark_recommendations":
            benchmarks,

        "dataset_analysis":
            suitability_analysis
    }

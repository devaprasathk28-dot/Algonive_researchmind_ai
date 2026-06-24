from fastapi import APIRouter

from app.ai.trend_prediction.topic_extractor import (
    extract_research_topics
)

from app.ai.trend_prediction.trend_analyzer import (
    analyze_topic_trends
)

from app.ai.trend_prediction.growth_predictor import (
    predict_growth
)

from app.ai.trend_prediction.trend_classifier import (
    classify_research_trends
)

from app.ai.trend_prediction.future_forecaster import (
    generate_future_predictions
)

router = APIRouter()

@router.post("/predict-research-trends")
def predict_ai_research_trends(
    payload: dict
):

    papers = payload["papers"]

    # ---------------------------------
    # Topic Extraction
    # ---------------------------------

    all_topics = []

    for paper in papers:

        topics = extract_research_topics(
            paper
        )

        all_topics.extend(topics)

    # ---------------------------------
    # Trend Analysis
    # ---------------------------------

    topic_frequency = (
        analyze_topic_trends(
            all_topics
        )
    )

    # ---------------------------------
    # Growth Prediction
    # ---------------------------------

    growth_predictions = (
        predict_growth(
            topic_frequency
        )
    )

    # ---------------------------------
    # Trend Classification
    # ---------------------------------

    classifications = (
        classify_research_trends(
            growth_predictions
        )
    )

    # ---------------------------------
    # Future Forecasting
    # ---------------------------------

    forecasts = (
        generate_future_predictions(
            classifications
        )
    )

    return {

        "detected_topics":
            all_topics,

        "topic_frequency":
            topic_frequency,

        "growth_predictions":
            growth_predictions,

        "trend_classifications":
            classifications,

        "future_forecasts":
            forecasts
    }

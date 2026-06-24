from app.realtime_research.arxiv_fetcher import (
    fetch_latest_papers
)

from app.realtime_research.topic_analyzer import (
    analyze_research_topics
)

from app.realtime_research.trend_monitor import (
    monitor_research_trends
)

from app.realtime_research.feed_generator import (
    generate_research_feed
)

from app.realtime_research.alert_engine import (
    generate_research_alerts
)

def execute_realtime_tracking(
    query
):

    # -----------------------------------
    # Fetch Latest Papers
    # -----------------------------------

    papers = fetch_latest_papers(
        query
    )

    # -----------------------------------
    # Topic Analysis
    # -----------------------------------

    topics = analyze_research_topics(
        papers
    )

    # -----------------------------------
    # Trend Monitoring
    # -----------------------------------

    trends = monitor_research_trends(
        topics
    )

    # -----------------------------------
    # Feed Generation
    # -----------------------------------

    feed = generate_research_feed(
        papers
    )

    # -----------------------------------
    # Alert Generation
    # -----------------------------------

    alerts = generate_research_alerts(
        trends
    )

    return {

        "query":
            query,

        "papers":
            papers,

        "detected_topics":
            topics,

        "trending_topics":
            trends,

        "research_feed":
            feed,

        "alerts":
            alerts
    }

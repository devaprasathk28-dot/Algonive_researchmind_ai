from app.alerts.topic_monitor import (
    monitor_topics
)

from app.alerts.spike_detector import (
    detect_trend_spikes
)

from app.alerts.breakthrough_detector import (
    detect_breakthroughs
)

from app.alerts.alert_generator import (
    generate_research_alerts
)

from app.alerts.notification_manager import (
    send_notifications
)

from app.realtime_research.arxiv_fetcher import (
    fetch_latest_papers
)

from app.realtime_research.topic_analyzer import (
    analyze_research_topics
)

from app.realtime_research.trend_monitor import (
    monitor_research_trends
)

def execute_live_alert_system(
    query
):

    # -----------------------------------
    # Fetch Live Papers
    # -----------------------------------

    papers = fetch_latest_papers(
        query
    )

    # -----------------------------------
    # Analyze Topics
    # -----------------------------------

    topics = analyze_research_topics(
        papers
    )

    # -----------------------------------
    # Monitor Trends
    # -----------------------------------

    trends = monitor_research_trends(
        topics
    )

    # -----------------------------------
    # Topic Monitoring
    # -----------------------------------

    monitored_topics = (
        monitor_topics(trends)
    )

    # -----------------------------------
    # Detect Spikes
    # -----------------------------------

    spikes = detect_trend_spikes(
        monitored_topics
    )

    # -----------------------------------
    # Detect Breakthroughs
    # -----------------------------------

    breakthroughs = (
        detect_breakthroughs(
            papers
        )
    )

    # -----------------------------------
    # Generate Alerts
    # -----------------------------------

    alerts = generate_research_alerts(
        spikes,
        breakthroughs
    )

    # -----------------------------------
    # Send Notifications
    # -----------------------------------

    notifications = (
        send_notifications(
            alerts
        )
    )

    return {

        "query":
            query,

        "monitored_topics":
            monitored_topics,

        "trend_spikes":
            spikes,

        "breakthroughs":
            breakthroughs,

        "alerts":
            alerts,

        "notifications":
            notifications
    }

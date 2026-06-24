def generate_research_alerts(
    trending_topics
):

    alerts = []

    for topic in trending_topics:

        if topic["trend_level"] == "Trending":

            alerts.append(
                f"🔥 {topic['topic']} is rapidly trending in current AI research."
            )

    return alerts

from collections import Counter

def monitor_research_trends(
    topics
):

    trend_counts = Counter(topics)

    trending_topics = []

    for topic, count in trend_counts.items():

        if count >= 2:

            trend_level = "Trending"

        else:

            trend_level = "Emerging"

        trending_topics.append({

            "topic": topic,

            "mentions": count,

            "trend_level": trend_level
        })

    return trending_topics

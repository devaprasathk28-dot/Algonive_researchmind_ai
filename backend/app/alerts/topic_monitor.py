def monitor_topics(
    trending_topics
):

    monitored_topics = []

    for topic in trending_topics:

        monitored_topics.append({

            "topic":
                topic["topic"],

            "mentions":
                topic["mentions"],

            "status":
                "monitored"
        })

    return monitored_topics

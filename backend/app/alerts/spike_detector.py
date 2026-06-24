def detect_trend_spikes(
    monitored_topics
):

    spikes = []

    for topic in monitored_topics:

        if topic["mentions"] >= 3:

            spikes.append({

                "topic":
                    topic["topic"],

                "spike_level":
                    "High"
            })

        elif topic["mentions"] >= 2:

            spikes.append({

                "topic":
                    topic["topic"],

                "spike_level":
                    "Moderate"
            })

    return spikes

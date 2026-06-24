from collections import Counter

def analyze_topic_trends(topics):

    topic_frequency = Counter(topics)

    return dict(topic_frequency)

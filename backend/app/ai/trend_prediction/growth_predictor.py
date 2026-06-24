def predict_growth(topic_frequency):

    growth_predictions = {}

    for topic, frequency in topic_frequency.items():

        growth_score = frequency * 10

        if growth_score >= 30:

            growth_level = "High Growth"

        elif growth_score >= 15:

            growth_level = "Moderate Growth"

        else:

            growth_level = "Emerging"

        growth_predictions[topic] = {

            "growth_score":
                growth_score,

            "growth_level":
                growth_level
        }

    return growth_predictions

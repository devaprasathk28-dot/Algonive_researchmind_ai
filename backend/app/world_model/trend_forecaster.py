def forecast_research_trends(
    temporal_data
):

    forecasts = []

    growth_data = temporal_data[
        "research_growth"
    ]

    for domain, values in growth_data.items():

        predicted_growth = (
            values[-1] * 1.4
        )

        forecasts.append({

            "domain":
                domain,

            "future_growth_estimate":
                round(predicted_growth, 2),

            "trend_direction":
                "strong_growth"
        })

    return forecasts

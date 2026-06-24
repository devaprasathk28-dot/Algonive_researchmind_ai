def generate_research_alerts(
    spikes,
    breakthroughs
):

    alerts = []

    # -----------------------------------
    # Trend Spike Alerts
    # -----------------------------------

    for spike in spikes:

        alerts.append(

            f"📈 {spike['topic']} research activity is increasing rapidly."
        )

    # -----------------------------------
    # Breakthrough Alerts
    # -----------------------------------

    for breakthrough in breakthroughs:

        alerts.append(

            f"🚀 Breakthrough detected: {breakthrough['paper']}"
        )

    return alerts

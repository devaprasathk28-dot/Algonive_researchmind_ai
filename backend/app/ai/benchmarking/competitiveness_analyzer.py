def analyze_competitiveness(
    rankings
):

    competitiveness = []

    for rank in rankings:

        if rank["ranking"] == "Near SOTA":

            competitiveness.append(
                f"{rank['dataset']} performance is close to state-of-the-art."
            )

        elif rank["ranking"] == "Competitive":

            competitiveness.append(
                f"{rank['dataset']} results are competitive."
            )

        else:

            competitiveness.append(
                f"{rank['dataset']} requires additional optimization."
            )

    return competitiveness

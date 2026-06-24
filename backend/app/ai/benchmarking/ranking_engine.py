def rank_research_performance(
    comparisons
):

    rankings = []

    for comparison in comparisons:

        gap = comparison["performance_gap"]

        if gap <= 2:

            ranking = "Near SOTA"

        elif gap <= 5:

            ranking = "Competitive"

        else:

            ranking = "Needs Improvement"

        rankings.append({

            "dataset":
                comparison["dataset"],

            "ranking":
                ranking
        })

    return rankings

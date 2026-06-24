def analyze_research_impact(
    citations,
    authors
):

    impact_score = (
        len(citations) * 2
    ) + len(authors)

    if impact_score >= 15:

        impact_level = "High"

    elif impact_score >= 8:

        impact_level = "Moderate"

    else:

        impact_level = "Low"

    return {

        "impact_score":
            impact_score,

        "impact_level":
            impact_level
    }

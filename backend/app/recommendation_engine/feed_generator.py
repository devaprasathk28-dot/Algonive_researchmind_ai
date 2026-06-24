def generate_personalized_feed(
    recommendations
):

    feed = []

    for item in recommendations:

        paper = item["paper"]

        feed.append({

            "recommended_paper":
                paper["title"],

            "similarity_score":
                round(
                    item["similarity_score"],
                    3
                ),

            "summary":
                paper["summary"][:200]
        })

    return feed

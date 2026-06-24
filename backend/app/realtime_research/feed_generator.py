def generate_research_feed(
    papers
):

    feed = []

    for paper in papers:

        feed.append({

            "headline":
                paper["title"],

            "published":
                paper["published"],

            "summary":
                paper["summary"][:200]
        })

    return feed

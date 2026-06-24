def generate_citation_summary(papers):

    citations = []

    for idx, paper in enumerate(papers):

        citations.append(
            f"[{idx+1}] {paper[:60]}..."
        )

    return citations

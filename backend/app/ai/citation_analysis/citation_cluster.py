def detect_citation_clusters(
    citations
):

    clusters = {

        "highly_connected_cluster":
            citations[:3],

        "emerging_cluster":
            citations[3:]
    }

    return clusters

def map_citation_relationships(
    citations
):

    relationships = []

    for i in range(
        len(citations) - 1
    ):

        relationships.append({

            "source":
                citations[i],

            "target":
                citations[i + 1],

            "relation":
                "cites"
        })

    return relationships

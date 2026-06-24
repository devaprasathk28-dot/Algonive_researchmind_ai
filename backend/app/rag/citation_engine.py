def attach_citations(
    retrieved_chunks
):
    citations = []
    for index, chunk in enumerate(
        retrieved_chunks
    ):
        citations.append({
            "chunk_id":
                index + 1,
            "preview":
                chunk[:150]
        })
    return citations

def detect_research_gaps(
    text
):

    gaps = []

    text = text.lower()

    if "multimodal" not in text and "multi-modal" not in text:

        gaps.append(

            "Multimodal integration not explored."
        )

    if "real-time" not in text and "real time" not in text:

        gaps.append(

            "Real-time processing not discussed."
        )

    if "scalability" not in text and "scale" not in text:

        gaps.append(

            "Scalability evaluation missing."
        )

    if not gaps:

        gaps.append(

            "No major gaps detected."
        )

    return gaps

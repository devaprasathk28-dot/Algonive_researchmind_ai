def rank_papers(

    paper_scores
):

    return sorted(

        paper_scores,

        key=lambda x: x["score"],

        reverse=True
    )

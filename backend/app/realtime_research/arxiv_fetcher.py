import arxiv

def fetch_latest_papers(
    query="artificial intelligence",
    max_results=5
):

    search = arxiv.Search(

        query=query,

        max_results=max_results,

        sort_by=arxiv.SortCriterion.SubmittedDate
    )

    papers = []

    for result in search.results():

        papers.append({

            "title":
                result.title,

            "authors":
                [author.name for author in result.authors],

            "summary":
                result.summary,

            "published":
                str(result.published),

            "pdf_url":
                result.pdf_url
        })

    return papers

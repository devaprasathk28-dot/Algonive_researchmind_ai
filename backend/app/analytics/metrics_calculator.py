import re

def calculate_metrics(parsed_paper):

    sections = parsed_paper.get(
        "sections",
        {}
    )

    full_text = ""

    for content in sections.values():

        full_text += content + "\n"

    word_count = len(
        full_text.split()
    )

    page_count = parsed_paper.get(
        "page_count",
        0
    )

    section_count = len(
        sections
    )

    figures = len(
        parsed_paper.get(
            "images",
            []
        )
    )

    tables = len(
        parsed_paper.get(
            "tables",
            []
        )
    )

    references = len(

        re.findall(
            r"\[\d+\]",
            full_text
        )
    )

    reading_time = max(
        1,
        round(word_count / 250)
    )

    return {

        "pages":
            page_count,

        "words":
            word_count,

        "sections":
            section_count,

        "figures":
            figures,

        "tables":
            tables,

        "references":
            references,

        "reading_time":
            reading_time
    }

def detect_breakthroughs(
    papers
):

    breakthroughs = []

    breakthrough_keywords = [

        "state-of-the-art",

        "novel architecture",

        "record accuracy",

        "breakthrough",

        "foundation model"
    ]

    for paper in papers:

        text = (
            paper["title"] + " " +
            paper["summary"]
        ).lower()

        for keyword in breakthrough_keywords:

            if keyword in text:

                breakthroughs.append({

                    "paper":
                        paper["title"],

                    "breakthrough_type":
                        keyword
                })

    return breakthroughs

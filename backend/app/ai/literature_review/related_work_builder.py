def generate_related_work_section(themes):

    related_work = (
        "Related Work\n\n"
    )

    for theme in themes:

        related_work += (
            f"Previous studies in {theme} "
            "have contributed significantly "
            "to AI research.\n\n"
        )

    return related_work

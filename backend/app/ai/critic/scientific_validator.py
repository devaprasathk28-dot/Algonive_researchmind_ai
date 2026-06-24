def validate_scientific_quality(
    sections
):

    required_sections = [

        "abstract",

        "introduction",

        "methodology",

        "results",

        "conclusion"
    ]

    missing_sections = []

    for section in required_sections:

        if section not in sections:

            missing_sections.append(
                section
            )

    return {

        "missing_sections":
            missing_sections,

        "scientific_completeness":

            "complete"
            if not missing_sections
            else "partial"
    }

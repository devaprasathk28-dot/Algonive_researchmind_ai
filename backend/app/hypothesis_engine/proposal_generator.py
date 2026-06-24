def generate_research_proposals(
    validated_hypotheses
):

    proposals = []

    for hypothesis in validated_hypotheses:

        proposals.append({

            "proposal_title":
                "AI-Generated Research Proposal",

            "core_hypothesis":
                hypothesis["hypothesis"],

            "research_potential":
                hypothesis["research_potential"],

            "recommended_next_step":
                "Conduct experimental validation."
        })

    return proposals

def decompose_research_tasks(
    interpreted_goal
):

    tasks = [

        "retrieve_research_papers",

        "generate_summaries",

        "perform_benchmark_analysis",

        "analyze_research_trends",

        "generate_future_work",

        "create_final_report"
    ]

    return {

        "goal":
            interpreted_goal[
                "original_goal"
            ],

        "decomposed_tasks":
            tasks
    }

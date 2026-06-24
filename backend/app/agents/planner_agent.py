def create_research_plan(goal):

    tasks = []

    goal_lower = goal.lower()

    if "research" in goal_lower:

        tasks.extend([
            "retrieve_papers",
            "summarize_papers",
            "compare_methods",
            "analyze_trends",
            "generate_report"
        ])

    return tasks

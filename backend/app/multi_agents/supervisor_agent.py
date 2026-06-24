def supervisor_agent(goal):

    tasks = [

        "summarization",

        "critique",

        "vision_analysis",

        "citation_analysis",

        "benchmarking",

        "trend_prediction"
    ]

    return {

        "goal": goal,

        "assigned_tasks": tasks
    }

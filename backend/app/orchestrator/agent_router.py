def assign_agents(tasks):

    agent_mapping = {

        "retrieve_context":
            "RAG Agent",

        "summarize_research":
            "Summarizer Agent",

        "analyze_methodology":
            "Critic Agent",

        "benchmark_analysis":
            "Benchmark Agent",

        "citation_analysis":
            "Citation Agent",

        "trend_prediction":
            "Trend Agent",

        "generate_report":
            "Report Agent"
    }

    assigned_tasks = []

    for task in tasks:

        assigned_tasks.append({

            "task_name":
                task["task_name"],

            "assigned_agent":
                agent_mapping.get(
                    task["task_name"],
                    "General Agent"
                )
        })

    return assigned_tasks

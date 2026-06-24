from app.agents.planner_agent import (
    create_research_plan
)

from app.agents.retrieval_agent import (
    retrieve_research_papers
)

from app.agents.summarizer_agent import (
    summarize_papers
)

from app.agents.critic_agent import (
    critique_research
)

from app.agents.trend_agent import (
    analyze_research_trends
)

from app.agents.report_agent import (
    generate_final_report
)

def execute_autonomous_research(goal):

    # -----------------------------------
    # Planning
    # -----------------------------------

    tasks = create_research_plan(goal)

    # -----------------------------------
    # Retrieval
    # -----------------------------------

    papers = retrieve_research_papers(
        goal
    )

    # -----------------------------------
    # Summarization
    # -----------------------------------

    summaries = summarize_papers(
        papers
    )

    # -----------------------------------
    # Critique
    # -----------------------------------

    critiques = critique_research(
        papers
    )

    # -----------------------------------
    # Trend Analysis
    # -----------------------------------

    trends = analyze_research_trends(
        papers
    )

    # -----------------------------------
    # Final Report
    # -----------------------------------

    results = {

        "papers": papers,

        "summaries": summaries,

        "critiques": critiques,

        "trends": trends
    }

    final_report = generate_final_report(
        results
    )

    return {

        "goal": goal,

        "planned_tasks": tasks,

        "autonomous_report":
            final_report
    }

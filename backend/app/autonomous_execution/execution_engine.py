from app.multi_agents.summarizer_agent import (
    summarizer_agent
)

from app.multi_agents.critic_agent import (
    critic_agent
)

from app.multi_agents.benchmark_agent import (
    benchmark_agent
)

from app.multi_agents.trend_agent import (
    trend_agent
)

def execute_autonomous_tasks(
    goal
):

    results = []

    # -----------------------------------
    # Summarization
    # -----------------------------------

    results.append(
        summarizer_agent(goal)
    )

    # -----------------------------------
    # Critique
    # -----------------------------------

    results.append(
        critic_agent(goal)
    )

    # -----------------------------------
    # Benchmarking
    # -----------------------------------

    results.append(
        benchmark_agent(goal)
    )

    # -----------------------------------
    # Trend Analysis
    # -----------------------------------

    results.append(
        trend_agent(goal)
    )

    return results

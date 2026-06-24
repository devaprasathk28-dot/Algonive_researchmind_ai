from app.orchestrator.workflow_planner import (
    create_execution_plan
)

from app.orchestrator.task_scheduler import (
    schedule_tasks
)

from app.orchestrator.agent_router import (
    assign_agents
)

from app.orchestrator.dependency_manager import (
    resolve_dependencies
)

from app.orchestrator.result_aggregator import (
    aggregate_results
)

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

def execute_ai_workflow(goal):

    # -----------------------------------
    # Workflow Planning
    # -----------------------------------

    workflow = create_execution_plan(
        goal
    )

    # -----------------------------------
    # Task Scheduling
    # -----------------------------------

    scheduled_tasks = schedule_tasks(
        workflow["workflow_steps"]
    )

    # -----------------------------------
    # Agent Assignment
    # -----------------------------------

    assigned_agents = assign_agents(
        scheduled_tasks
    )

    # -----------------------------------
    # Dependency Resolution
    # -----------------------------------

    dependencies = resolve_dependencies(
        scheduled_tasks
    )

    # -----------------------------------
    # Agent Execution
    # -----------------------------------

    results = [

        summarizer_agent(goal),

        critic_agent(goal),

        benchmark_agent(goal),

        trend_agent(goal)
    ]

    # -----------------------------------
    # Result Aggregation
    # -----------------------------------

    final_output = aggregate_results(
        results
    )

    return {

        "workflow_plan":
            workflow,

        "scheduled_tasks":
            scheduled_tasks,

        "assigned_agents":
            assigned_agents,

        "dependencies":
            dependencies,

        "final_output":
            final_output
    }

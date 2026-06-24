from app.autonomous_execution.goal_interpreter import (
    interpret_research_goal
)

from app.autonomous_execution.task_decomposer import (
    decompose_research_tasks
)

from app.autonomous_execution.autonomous_planner import (
    create_autonomous_plan
)

from app.autonomous_execution.execution_engine import (
    execute_autonomous_tasks
)

from app.autonomous_execution.reflection_engine import (
    reflect_on_results
)

from app.autonomous_execution.iteration_engine import (
    iterative_improvement
)

from app.autonomous_execution.report_generator import (
    generate_autonomous_report
)

def execute_autonomous_research(
    goal
):

    # -----------------------------------
    # Goal Understanding
    # -----------------------------------

    interpreted_goal = (
        interpret_research_goal(
            goal
        )
    )

    # -----------------------------------
    # Task Decomposition
    # -----------------------------------

    decomposed_tasks = (
        decompose_research_tasks(
            interpreted_goal
        )
    )

    # -----------------------------------
    # Autonomous Planning
    # -----------------------------------

    workflow = (
        create_autonomous_plan(
            decomposed_tasks[
                "decomposed_tasks"
            ]
        )
    )

    # -----------------------------------
    # Autonomous Execution
    # -----------------------------------

    execution_results = (
        execute_autonomous_tasks(
            goal
        )
    )

    # -----------------------------------
    # Reflection
    # -----------------------------------

    reflections = (
        reflect_on_results(
            execution_results
        )
    )

    # -----------------------------------
    # Iterative Improvement
    # -----------------------------------

    improvements = (
        iterative_improvement(
            reflections
        )
    )

    # -----------------------------------
    # Final Report
    # -----------------------------------

    report = (
        generate_autonomous_report(

            execution_results,

            reflections,

            improvements
        )
    )

    return {

        "interpreted_goal":
            interpreted_goal,

        "workflow":
            workflow,

        "execution_results":
            execution_results,

        "reflections":
            reflections,

        "improvements":
            improvements,

        "final_report":
            report
    }

workflow_state = {

    "current_workflow": None,

    "completed_tasks": [],

    "failed_tasks": [],

    "active_agents": []
}

def update_workflow_state(
    task,
    status
):

    if status == "completed":

        workflow_state[
            "completed_tasks"
        ].append(task)

    elif status == "failed":

        workflow_state[
            "failed_tasks"
        ].append(task)

    return workflow_state

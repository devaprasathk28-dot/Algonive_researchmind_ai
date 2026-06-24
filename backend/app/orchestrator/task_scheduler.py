def schedule_tasks(workflow_steps):

    scheduled_tasks = []

    for index, step in enumerate(
        workflow_steps
    ):

        scheduled_tasks.append({

            "task_id":
                index + 1,

            "task_name":
                step,

            "status":
                "scheduled"
        })

    return scheduled_tasks

def create_autonomous_plan(
    tasks
):

    workflow = []

    for index, task in enumerate(
        tasks
    ):

        workflow.append({

            "step":
                index + 1,

            "task":
                task,

            "execution_status":
                "pending"
        })

    return workflow

def resolve_dependencies(tasks):

    dependencies = []

    for index in range(
        1,
        len(tasks)
    ):

        dependencies.append({

            "task":
                tasks[index]["task_name"],

            "depends_on":
                tasks[index - 1]["task_name"]
        })

    return dependencies

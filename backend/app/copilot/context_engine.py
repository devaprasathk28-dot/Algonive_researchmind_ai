from app.memory.memory_manager import (
    retrieve_agent_memory
)

def build_contextual_understanding(
    query
):

    memory_context = (
        retrieve_agent_memory(
            query
        )
    )

    return {

        "query":
            query,

        "contextual_memory":
            memory_context
    }

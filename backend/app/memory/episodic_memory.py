episodic_memory = []

def save_research_episode(
    query,
    result
):

    episode = {

        "query": query,

        "result": result
    }

    episodic_memory.append(
        episode
    )

    return {
        "status":
            "episode_saved"
    }

def get_recent_episodes():

    return episodic_memory[-5:]

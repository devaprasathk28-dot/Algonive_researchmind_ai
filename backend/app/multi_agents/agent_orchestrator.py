from app.multi_agents.supervisor_agent import (
    supervisor_agent
)

from app.multi_agents.summarizer_agent import (
    summarizer_agent
)

from app.multi_agents.critic_agent import (
    critic_agent
)

from app.multi_agents.vision_agent import (
    vision_agent
)

from app.multi_agents.citation_agent import (
    citation_agent
)

from app.multi_agents.benchmark_agent import (
    benchmark_agent
)

from app.multi_agents.dataset_agent import (
    dataset_agent
)

from app.multi_agents.trend_agent import (
    trend_agent
)

from app.multi_agents.rag_agent import (
    rag_agent
)

from app.multi_agents.reviewer_agent import (
    reviewer_agent
)

def execute_multi_agent_workflow(
    text
):

    # -----------------------------------
    # Supervisor Planning
    # -----------------------------------

    supervisor = supervisor_agent(
        text
    )

    # -----------------------------------
    # Parallel Agent Execution
    # -----------------------------------

    summary = summarizer_agent(text)

    critique = critic_agent(text)

    vision = vision_agent(text)

    citations = citation_agent(text)

    benchmark = benchmark_agent(text)

    datasets = dataset_agent(text)

    trends = trend_agent(text)

    rag = rag_agent(text)

    reviewer = reviewer_agent(text)

    # -----------------------------------
    # Aggregate Results
    # -----------------------------------

    return {

        "supervisor":
            supervisor,

        "agent_results": [

            summary,
            critique,
            vision,
            citations,
            benchmark,
            datasets,
            trends,
            rag,
            reviewer
        ]
    }

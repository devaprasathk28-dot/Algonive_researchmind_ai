from typing import Dict, Any, List

short_term_memory: Dict[str, Any] = {
    "active_workspace_id": None,
    "recent_papers": [],
    "recent_queries": [],
    "active_tasks": [],
    "current_context": []
}

def set_active_workspace(workspace_id: int):
    short_term_memory["active_workspace_id"] = workspace_id

def add_recent_paper(title: str):
    if title not in short_term_memory["recent_papers"]:
        short_term_memory["recent_papers"].append(title)
        short_term_memory["recent_papers"] = short_term_memory["recent_papers"][-5:]

def add_recent_query(query: str):
    if query not in short_term_memory["recent_queries"]:
        short_term_memory["recent_queries"].append(query)
        short_term_memory["recent_queries"] = short_term_memory["recent_queries"][-5:]

def add_active_task(task: str):
    if task not in short_term_memory["active_tasks"]:
        short_term_memory["active_tasks"].append(task)

def clear_active_tasks():
    short_term_memory["active_tasks"] = []

def get_short_term_context() -> Dict[str, Any]:
    return short_term_memory

import networkx as nx

LABEL_PRIORITY = {
    "PAPER": 10,
    "MODEL": 9,
    "METHOD": 8,
    "DATASET": 8,
    "FRAMEWORK": 8,
    "TASK": 8,
    "METRIC": 8,
    "DOMAIN": 7,
    "CONCEPT": 7,
    "PERSON": 6,
    "ORG": 5,
}

def build_knowledge_graph(
    entities: list[dict],
    relations: list[dict],
) -> nx.DiGraph:
    """
    Construct directed graph, setting node types, frequency counts, confidence values,
    and linking semantic relationships with edge weights.
    """
    graph = nx.DiGraph()

    # 1. Add nodes with metadata
    for entity in entities:
        node_id = entity["text"]
        label = entity.get("label", "CONCEPT").upper()

        if graph.has_node(node_id):
            node_data = graph.nodes[node_id]
            node_data["mention_count"] += 1
            node_data["frequency"] = node_data["mention_count"]
            
            # Keep label with higher priority
            current_priority = LABEL_PRIORITY.get(node_data["label"], 0)
            new_priority = LABEL_PRIORITY.get(label, 0)
            if new_priority > current_priority:
                node_data["label"] = label
        else:
            graph.add_node(
                node_id,
                label=label,
                mention_count=1,
                frequency=1,
                confidence=0.95
            )

    # 2. Add edges with relationship details
    for relation in relations:
        source = relation["source"]
        target = relation["target"]
        relation_name = relation.get("relation", "USES").upper()

        if source == target:
            continue
            
        # Guarantee source and target nodes exist in graph
        if not graph.has_node(source):
            graph.add_node(source, label="CONCEPT", mention_count=1, frequency=1, confidence=0.9)
        if not graph.has_node(target):
            graph.add_node(target, label="CONCEPT", mention_count=1, frequency=1, confidence=0.9)

        if graph.has_edge(source, target):
            edge_data = graph[source][target]
            edge_data["weight"] += 1
            if relation_name not in edge_data["relations"]:
                edge_data["relations"].append(relation_name)
        else:
            graph.add_edge(
                source,
                target,
                relation=relation_name,
                relations=[relation_name],
                weight=1,
            )

    return graph

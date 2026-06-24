import networkx as nx

def build_knowledge_graph(relationships):
    graph = nx.Graph()
    for relation in relationships:
        graph.add_edge(
            relation["source"],
            relation["target"],
            relation=relation["relation"]
        )
    return graph

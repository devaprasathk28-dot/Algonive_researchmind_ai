import networkx as nx

def build_citation_graph(
    relationships
):

    graph = nx.DiGraph()

    for relation in relationships:

        graph.add_edge(

            relation["source"],

            relation["target"],

            relation=relation["relation"]
        )

    return graph

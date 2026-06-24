from app.knowledge_graph.relation_extractor import extract_relations

def build_relations(text: str, entities: list[dict]) -> list[dict]:
    """
    Build structured relationship triples from the text context and classified entities list.
    """
    return extract_relations(text, entities)

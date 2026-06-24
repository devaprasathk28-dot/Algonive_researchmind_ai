from app.knowledge_graph.entity_extractor import extract_entities
from app.knowledge_graph.concept_extractor import extract_research_concepts
from app.knowledge_graph.graph_builder import build_knowledge_graph
from app.knowledge_graph.graph_serializer import serialize_graph
from app.knowledge_graph.relation_extractor import extract_relations


MAX_TEXT_LENGTH = 20_000


def _combine_paper_text(parsed_paper: dict) -> str:
    text_parts: list[str] = []

    sections = parsed_paper.get("sections", {})
    if isinstance(sections, dict):
        text_parts.extend(str(section) for section in sections.values() if section)

    direct_text = parsed_paper.get("text") or parsed_paper.get("extracted_text")
    if direct_text and not sections:
        text_parts.append(str(direct_text))

    if not text_parts and parsed_paper.get("title"):
        text_parts.append(str(parsed_paper["title"]))

    return "\n".join(text_parts).strip()[:MAX_TEXT_LENGTH]


def _metadata_entities_and_relations(parsed_paper: dict) -> tuple[list[dict], list[dict]]:
    title = str(parsed_paper.get("title", "")).strip()
    authors = parsed_paper.get("authors", [])
    entities: list[dict] = []
    relations: list[dict] = []

    if title:
        entities.append(
            {
                "text": title,
                "label": "PAPER",
                "start": -1,
                "end": -1,
                "sentence_id": -1,
            }
        )

    if isinstance(authors, list):
        for author in authors[:20]:
            author_name = str(author).strip()
            if not author_name:
                continue
            entities.append(
                {
                    "text": author_name,
                    "label": "PERSON",
                    "start": -1,
                    "end": -1,
                    "sentence_id": -1,
                }
            )
            if title:
                relations.append(
                    {
                        "source": title,
                        "target": author_name,
                        "relation": "authored_by",
                    }
                )

    return entities, relations


def generate_knowledge_graph(parsed_paper: dict) -> dict:
    full_text = _combine_paper_text(parsed_paper)
    if not full_text:
        raise ValueError("Provide paper sections, extracted_text, or text.")

    metadata_entities, metadata_relations = _metadata_entities_and_relations(parsed_paper)
    extracted_entities = extract_entities(full_text)
    concepts = extract_research_concepts(full_text)

    # Align concept properties to avoid relational extraction failures
    for c in concepts:
        c["start"] = -1
        c["end"] = -1
        c["sentence_id"] = -1

    extracted_entities.extend(concepts)
    extracted_relations = extract_relations(full_text, extracted_entities)

    entities = metadata_entities + extracted_entities
    relations = metadata_relations + extracted_relations
    graph = build_knowledge_graph(entities, relations)

    # Step 36 Upgrades: Centrality, Community detection, Ecosystem insights, and Metrics
    from app.knowledge_graph.graph_analyzer import analyze_graph
    from app.knowledge_graph.graph_metrics import calculate_graph_metrics

    analysis = analyze_graph(graph)
    metrics = calculate_graph_metrics(graph)

    serialized_graph = serialize_graph(
        graph, 
        centrality=analysis["centrality"], 
        communities=analysis["communities"]
    )

    return {
        **serialized_graph,
        "entities": [
            {"text": node["id"], "label": node["label"]}
            for node in serialized_graph["nodes"]
        ],
        "relationships": serialized_graph["edges"],
        "total_nodes": len(serialized_graph["nodes"]),
        "total_edges": len(serialized_graph["edges"]),
        "metrics": metrics,
        "ecosystem": analysis["ecosystem"]
    }


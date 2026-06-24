def map_relationships(entities):
    relationships = []
    for i in range(len(entities) - 1):
        source = entities[i]["text"]
        target = entities[i + 1]["text"]
        relationships.append({
            "source": source,
            "target": target,
            "relation": "related_to"
        })
    return relationships

import re

# Regex patterns matching text indicators to one of the 15 RELATION_TYPES in uppercase
RELATION_PATTERNS = [
    (re.compile(r"\b(?:train|trained|pretrain|pretrained|fine-tune|fine-tuned)\b.*\bon\b", re.I), "TRAINS_ON"),
    (re.compile(r"\b(?:evaluate|evaluated|test|tested|benchmark|benchmarked)\b.*\bon\b", re.I), "EVALUATED_ON"),
    (re.compile(r"\b(?:use|uses|using|utilize|utilizes|employ|employs)\b", re.I), "USES"),
    (re.compile(r"\b(?:based on|builds on|derived from)\b", re.I), "BASED_ON"),
    (re.compile(r"\b(?:outperform|outperforms|surpass|surpasses|beats)\b", re.I), "OUTPERFORMS"),
    (re.compile(r"\b(?:implemented in|implemented using|written in|built with)\b", re.I), "IMPLEMENTED_IN"),
    (re.compile(r"\b(?:compared with|compares with|compared against|compared to)\b", re.I), "COMPARES_WITH"),
    (re.compile(r"\b(?:improve|improves|enhance|enhances|optimizes)\b", re.I), "IMPROVES"),
    (re.compile(r"\b(?:predict|predicts|forecast|forecasting)\b", re.I), "PREDICTS"),
    (re.compile(r"\b(?:classify|classifies|classification)\b", re.I), "CLASSIFIES"),
    (re.compile(r"\b(?:detect|detects|detection)\b", re.I), "DETECTS"),
    (re.compile(r"\b(?:generate|generates|generation)\b", re.I), "GENERATES"),
    (re.compile(r"\b(?:cite|cites|cited by)\b", re.I), "CITES"),
    (re.compile(r"\b(?:propose|proposes|introduce|introduces|present|presents)\b", re.I), "PROPOSES"),
    (re.compile(r"\b(?:extend|extends|generalizes|generalize)\b", re.I), "EXTENDS"),
]

def _infer_relation(context: str, source: dict, target: dict) -> str:
    for pattern, relation in RELATION_PATTERNS:
        if pattern.search(context):
            return relation

    # Heuristic fallback based on entity types
    src_lbl = source.get("label", "").upper()
    tgt_lbl = target.get("label", "").upper()

    if src_lbl in {"MODEL", "METHOD"} and tgt_lbl == "DATASET":
        return "EVALUATED_ON"
    if src_lbl == "MODEL" and tgt_lbl in {"METHOD", "CONCEPT"}:
        return "USES"
    if src_lbl == "MODEL" and tgt_lbl == "FRAMEWORK":
        return "IMPLEMENTED_IN"
    if tgt_lbl == "METRIC":
        return "EVALUATED_ON"
    if tgt_lbl == "PERSON":
        return "CITES"

    return "USES" # Default to USES rather than "related_to" to match standard relation types

def extract_relations(text: str, entities: list[dict]) -> list[dict]:
    entities_by_sentence: dict[int, list[dict]] = {}
    for entity in entities:
        if entity.get("sentence_id", -1) < 0:
            continue
        entities_by_sentence.setdefault(entity["sentence_id"], []).append(entity)

    relations: list[dict] = []
    seen: set[tuple[str, str, str]] = set()

    for sentence_entities in entities_by_sentence.values():
        ordered = sorted(sentence_entities, key=lambda entity: entity.get("start", 0))
        unique_in_sentence: list[dict] = []
        seen_names: set[str] = set()

        for entity in ordered:
            key = entity["text"].casefold()
            if key not in seen_names:
                seen_names.add(key)
                unique_in_sentence.append(entity)

        for source, target in zip(unique_in_sentence, unique_in_sentence[1:]):
            if source["text"].casefold() == target["text"].casefold():
                continue

            context_start = source.get("start", 0)
            context_end = target.get("end", 0)
            if context_start >= 0 and context_end >= 0:
                context = text[context_start:context_end]
            else:
                context = ""
                
            relation = _infer_relation(context, source, target)
            relation_key = (
                source["text"].casefold(),
                target["text"].casefold(),
                relation,
            )

            if relation_key in seen:
                continue

            seen.add(relation_key)
            relations.append(
                {
                    "source": source["text"],
                    "target": target["text"],
                    "relation": relation,
                }
            )

    return relations

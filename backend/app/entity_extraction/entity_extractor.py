import spacy

nlp = spacy.load(
    "en_core_sci_sm"
)

def extract_entities(text: str) -> list:
    """
    Extract scientific entities with their start/end char positions and sentence index context.
    """
    if not text or not text.strip():
        return []

    doc = nlp(text)
    entities = []
    seen = set()

    sentence_ids = {}
    for sentence_id, sentence in enumerate(doc.sents):
        for token_index in range(sentence.start, sentence.end):
            sentence_ids[token_index] = sentence_id

    for ent in doc.ents:
        # Ignore very short or single character non-word entities to reduce noise
        clean_text = ent.text.strip()
        if len(clean_text) <= 1 or clean_text.lower() in seen:
            continue
        seen.add(clean_text.lower())

        entities.append({
            "text": clean_text,
            "label": ent.label_,
            "start": ent.start_char,
            "end": ent.end_char,
            "sentence_id": sentence_ids.get(ent.start, 0)
        })

    return entities

import re

def analyze_complexity(text: str, entities: list = None) -> dict:
    """
    Calculate complexity score out of 10 based on scientific terms, equations, entities count,
    and average sentence length. Maps the score to Basic, Intermediate, Advanced, or Research Grade.
    """
    if entities is None:
        entities = []

    text_lower = text.lower()

    # 1. Technical terms score: count scientific entities ofML/CS types
    sci_types = {"MODEL", "DATASET", "FRAMEWORK", "METHOD", "METRIC", "TASK"}
    technical_terms_count = sum(1 for e in entities if e.get("type", e.get("label", "")).upper() in sci_types)
    technical_terms_score = min(technical_terms_count / 5.0, 10.0)

    # 2. Equations score: match mathematical symbols, equations keywords, or LaTeX math blocks
    math_patterns = [
        r'\b(eq|equation|formula)\b',
        r'[\+\-\*/=\^<>≈∑∫∏√πθλμσδεαβγ]',
        r'\$\$.*?\$\$',
        r'\$.*?\$'
    ]
    math_matches = 0
    for pattern in math_patterns:
        math_matches += len(re.findall(pattern, text))
    equations_score = min(math_matches / 10.0, 10.0)

    # 3. Entities density score
    entities_score = min(len(entities) / 10.0, 10.0)

    # 4. Average sentence length score
    sentences = [s.strip() for s in re.split(r'[\.\!\?]', text) if s.strip()]
    if sentences:
        words = text.split()
        avg_sentence_len = len(words) / len(sentences)
    else:
        avg_sentence_len = 15.0
    avg_sentence_length_score = min(avg_sentence_len / 5.0, 10.0)

    # Calculate final weighted score out of 10
    complexity_score = (
        technical_terms_score * 0.3 +
        equations_score * 0.2 +
        entities_score * 0.2 +
        avg_sentence_length_score * 0.3
    )

    # Map to levels: Basic, Intermediate, Advanced, Research Grade
    if complexity_score < 3.0:
        level = "Basic"
    elif complexity_score < 6.0:
        level = "Intermediate"
    elif complexity_score < 8.0:
        level = "Advanced"
    else:
        level = "Research Grade"

    return {
        "score": round(complexity_score, 2),
        "complexity": level
    }

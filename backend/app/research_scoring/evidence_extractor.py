import re

def extract_evidence(text: str, entities: list = None) -> dict:
    """
    Extract key evidence signals from paper text and scientific entities.
    Returns:
        dict: Counts of models, datasets, experiments, benchmarks, references, novel terms, etc.
    """
    text_lower = text.lower() if text else ""
    
    # 1. Base counts from entity classification if provided
    models_list = []
    datasets_list = []
    methods_list = []
    benchmarks_list = []
    
    if entities:
        for ent in entities:
            ent_text = ent.get("text", "")
            ent_type = ent.get("type", "GENERAL").upper()
            if ent_type == "MODEL" and ent_text not in models_list:
                models_list.append(ent_text)
            elif ent_type == "DATASET" and ent_text not in datasets_list:
                datasets_list.append(ent_text)
            elif ent_type in ("METHOD", "FRAMEWORK") and ent_text not in methods_list:
                methods_list.append(ent_text)
            elif ent_type == "METRIC" and ent_text not in benchmarks_list:
                benchmarks_list.append(ent_text)

    # 2. Extract references / inline citations
    # Matches patterns like [1], [1, 2], [1-3] or (Smith et al., 2020)
    brackets_citations = len(re.findall(r'\[\s*\d+(?:\s*,\s*\d+)*\s*\]|\[\s*\d+\s*-\s*\d+\s*\]', text or ""))
    paren_citations = len(re.findall(r'\(\s*[A-Z][a-zA-Z\s]+et\s+al\.\s*,\s*\d{4}\s*\)|\(\s*[A-Z][a-zA-Z\s]+\s*&\s*[A-Z][a-zA-Z\s]+,\s*\d{4}\s*\)', text or ""))
    citations_count = max(brackets_citations + paren_citations, len(re.findall(r'\[\d+\]', text or "")))
    
    # 3. Detect experiments mentioned
    # Look for headers or sentences describing setups
    experiments_mentions = len(re.findall(r'\b(experiment|experimental setup|evaluation|training procedure|ablation study)\b', text_lower))
    
    # 4. Benchmarks & baselines count
    benchmark_mentions = len(re.findall(r'\b(benchmark|baseline|sota|state-of-the-art|comparison|compare with)\b', text_lower))
    
    # 5. Proposed/novel methods terms
    novel_terms_mentions = len(re.findall(r'\b(we propose|we introduce|we present|our novel|new architecture|new method|proposed approach)\b', text_lower))
    
    # 6. Technical equations / math notation count
    equations_count = len(re.findall(r'\$\$[\s\S]*?\$\$|\$.*?\$|\\begin\{equation\}[\s\S]*?\\end\{equation\}|[\+\-\*/=<>]{2,}', text or ""))
    
    # 7. Code repository search
    github_links = re.findall(r'github\.com/[a-zA-Z0-9_\-]+/[a-zA-Z0-9_\-]+', text or "")
    has_code = len(github_links) > 0

    return {
        "models": len(models_list),
        "models_list": models_list[:10],
        "datasets": len(datasets_list),
        "datasets_list": datasets_list[:10],
        "methods": len(methods_list),
        "methods_list": methods_list[:10],
        "benchmarks": max(len(benchmarks_list), benchmark_mentions),
        "references": citations_count,
        "experiments": max(1, experiments_mentions),
        "novel_terms": novel_terms_mentions,
        "equations": equations_count,
        "has_code": has_code,
        "github_links": github_links
    }

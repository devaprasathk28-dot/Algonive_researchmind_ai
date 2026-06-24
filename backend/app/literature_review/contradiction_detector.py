from typing import List, Dict, Any

def detect_contradictions(consolidated_entities: Dict[str, List[Dict[str, Any]]], papers_comparison: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Detect potential contradictions, architectural trade-offs, or opposing methodologies across papers.
    """
    contradictions = []
    
    # 1. Architectural tradeoffs (Attention vs. Recurrence)
    has_trans = False
    has_lstm = False
    trans_papers = []
    lstm_papers = []
    
    for paper in papers_comparison:
        models_lower = [m.lower() for m in paper["models"]]
        if any("transformer" in m or "bert" in m or "gpt" in m or "llama" in m or "mistral" in m for m in models_lower):
            has_trans = True
            trans_papers.append(paper["title"])
        if any("lstm" in m or "rnn" in m or "gru" in m for m in models_lower):
            has_lstm = True
            lstm_papers.append(paper["title"])
            
    if has_trans and has_lstm:
        contradictions.append({
            "category": "Architectural Conflict",
            "conflict": "Attention vs. Recurrence: Debate on using self-attention mechanisms (transformers) versus recurrent representations (LSTMs/RNNs) for sequential data.",
            "papers_involved": sorted(list(set(trans_papers + lstm_papers)))
        })
        
    # 2. Methodological trade-offs (Fine-tuning vs. Prompting)
    has_pretrain = False
    has_prompt = False
    pretrain_papers = []
    prompt_papers = []
    
    for paper in papers_comparison:
        methods_lower = [m.lower() for m in paper["methods"]]
        if any("pre-training" in m or "pretraining" in m or "supervised learning" in m for m in methods_lower):
            has_pretrain = True
            pretrain_papers.append(paper["title"])
        if any("prompt" in m or "zero-shot" in m or "few-shot" in m or "in-context" in m for m in methods_lower):
            has_prompt = True
            prompt_papers.append(paper["title"])
            
    if has_pretrain and has_prompt:
        contradictions.append({
            "category": "Methodological Divergence",
            "conflict": "Weight Update vs. In-Context Learning: Contrast between computational heavy weight-updating fine-tuning and resource-efficient prompt engineering.",
            "papers_involved": sorted(list(set(pretrain_papers + prompt_papers)))
        })

    # 3. Specific historical contrast (BERT vs RoBERTa)
    titles_lower = [p["title"].lower() for p in papers_comparison]
    is_bert = any("bert" in t for t in titles_lower)
    is_roberta = any("roberta" in t for t in titles_lower)
    if is_bert and is_roberta:
        contradictions.append({
            "category": "Objective Function Conflict",
            "conflict": "Next Sentence Prediction (NSP) utility: BERT argues NSP improves downstream task learning, while RoBERTa argues removing NSP improves downstream performance.",
            "papers_involved": [p["title"] for p in papers_comparison if "bert" in p["title"].lower() or "roberta" in p["title"].lower()]
        })
        
    if not contradictions and len(papers_comparison) >= 2:
        p1 = papers_comparison[0]
        p2 = papers_comparison[1]
        contradictions.append({
            "category": "Evaluation Scope Conflict",
            "conflict": f"Benchmark Divergence: Different target settings and parameter evaluations between '{p1['title']}' and '{p2['title']}'.",
            "papers_involved": [p1["title"], p2["title"]]
        })
        
    return contradictions

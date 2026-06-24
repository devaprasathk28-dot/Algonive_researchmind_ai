from typing import Dict, Any

def recommend_models(task: str, resources: str) -> Dict[str, Any]:
    """
    Recommend a neural architecture configuration matching task constraints and compute profiles.
    """
    task_l = task.lower()
    res_l = resources.lower()
    
    rec_model = "RoBERTa-base"
    params = "125M params"
    reason = "Best general classification and token extraction baseline for resource-constrained environments."
    alternatives = ["DeBERTa-v3-base", "BERT-base"]
    
    if "generation" in task_l or "llm" in task_l or "advisor" in task_l:
        if "cpu" in res_l or "low" in res_l:
            rec_model = "Flan-T5-base"
            params = "250M params"
            reason = "Text-to-text model designed for low-memory instruction tasks. Operates well on pure CPU threads."
            alternatives = ["Flan-T5-small", "TinyLLaMA-1.1B"]
        else:
            rec_model = "LLaMA-3-8B-Instruct"
            params = "8 Billion params"
            reason = "State-of-the-art open weight instruct model. Excels at complex reasoning, generation, and multi-document synthesis."
            alternatives = ["Mistral-7B-Instruct-v0.3", "Gemma-2-9B-It"]
            
    elif "retrieval" in task_l or "rag" in task_l or "search" in task_l:
        if "cpu" in res_l or "low" in res_l:
            rec_model = "all-MiniLM-L6-v2"
            params = "22M params"
            reason = "Extremely fast, lightweight encoder. Generates high-quality sentence embeddings on standard local hardware."
            alternatives = ["all-distilroberta-v1", "bge-small-en-v1.5"]
        else:
            rec_model = "all-mpnet-base-v2"
            params = "110M params"
            reason = "Best overall sentence transformer mapping semantic retrieval mappings on standard GPUs."
            alternatives = ["bge-large-en-v1.5", "cohere-embed-english-v3"]
            
    elif "classification" in task_l or "ner" in task_l or "entity" in task_l:
        if "cpu" in res_l or "low" in res_l:
            rec_model = "DeBERTa-v3-small"
            params = "44M params"
            reason = "Implements disentangled attention mechanism, outperforming larger BERT-base models on sequence tagging on CPU."
            alternatives = ["DistilBERT-base", "BERT-tiny"]
        else:
            rec_model = "RoBERTa-large"
            params = "355M params"
            reason = "Extremely robust transformer model pre-trained longer on larger datasets. Captures structural correlations with high precision."
            alternatives = ["DeBERTa-v3-large", "BERT-large"]

    return {
        "recommended_model": rec_model,
        "parameter_size": params,
        "suitability_reason": reason,
        "alternatives": alternatives
    }

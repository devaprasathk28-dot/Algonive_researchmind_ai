import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

_tokenizer = None
_model = None

def get_model_and_tokenizer():
    global _tokenizer, _model
    if _model is None or _tokenizer is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
        _model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base").to(device)
    return _model, _tokenizer

def generate_rag_answer(
    question,
    context
):
    prompt = f"""
    Answer the question using the research paper context.

    Context:
    {context}

    Question:
    {question}
    """
    model, tokenizer = get_model_and_tokenizer()
    device = next(model.parameters()).device
    
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=256,
            do_sample=False
        )
        
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

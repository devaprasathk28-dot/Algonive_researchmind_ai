import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# Global cached tokenizer and model references
_tokenizer = None
_model = None

def get_model_and_tokenizer():
    global _tokenizer, _model
    if _model is None or _tokenizer is None:
        print("Loading/Downloading google/flan-t5-base model (this may take a few minutes on first run)...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
        _model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base").to(device)
    return _model, _tokenizer

def generate_summary(
    prompt
):
    model, tokenizer = get_model_and_tokenizer()
    
    device = next(model.parameters()).device
    
    # Flan-T5 has a 512 max context length. Truncate inputs to prevent warnings/errors.
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=256,
            do_sample=False,
            repetition_penalty=2.5,
            no_repeat_ngram_size=3
        )
        
    return tokenizer.decode(outputs[0], skip_special_tokens=True)



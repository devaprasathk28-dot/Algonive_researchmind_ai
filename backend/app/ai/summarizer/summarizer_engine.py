import re
from typing import List, Optional
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

# Global cached tokenizer and model
_tokenizer = None
_model = None

def get_model_and_tokenizer():
    global _tokenizer, _model
    if _model is None or _tokenizer is None:
        model_name = "sshleifer/distilbart-cnn-12-6"
        _tokenizer = AutoTokenizer.from_pretrained(model_name)
        _model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    return _model, _tokenizer


def generate_summary(text: str) -> str:
    """
    Generate a short TL;DR summary using the AutoModel / AutoTokenizer.
    """
    # Avoid extremely long input
    text = text[:4000]

    model, tokenizer = get_model_and_tokenizer()
    inputs = tokenizer(text, max_length=1024, truncation=True, return_tensors="pt")

    summary_ids = model.generate(
        inputs["input_ids"],
        num_beams=4,
        max_length=200,
        min_length=50,
        early_stopping=True
    )

    return tokenizer.decode(summary_ids[0], skip_special_tokens=True)


def beginner_friendly_summary(text: str) -> str:
    """
    Generate a simplified summary based on a structured prompt.
    """
    text = text[:3000]

    prompt = f"""Explain this research paper in simple beginner-friendly language:

{text}"""

    model, tokenizer = get_model_and_tokenizer()
    inputs = tokenizer(prompt, max_length=1024, truncation=True, return_tensors="pt")

    summary_ids = model.generate(
        inputs["input_ids"],
        num_beams=4,
        max_length=250,
        min_length=80,
        early_stopping=True
    )

    return tokenizer.decode(summary_ids[0], skip_special_tokens=True)


def extract_key_contributions(text: str) -> List[str]:
    """
    Extract lines matching academic contribution keywords.
    """
    lines = text.split("\n")
    contributions = []

    keywords = [
        "we propose",
        "this paper presents",
        "our contribution",
        "we introduce",
        "we developed"
    ]

    for line in lines:
        lower = line.lower()
        for keyword in keywords:
            if keyword in lower:
                contributions.append(line.strip())
                break  # Don't add the same line twice if it matches multiple keywords

    return contributions[:5]

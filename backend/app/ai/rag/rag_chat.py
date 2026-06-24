from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

tokenizer = None
model = None

def get_generator():
    global tokenizer, model
    if tokenizer is None or model is None:
        tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
        model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base")
    return tokenizer, model

def generate_rag_answer(query, retrieved_chunks):
    """
    Generate an answer to a query using retrieved context.
    """
    context = "\n".join(retrieved_chunks)
    prompt = f"""
    Answer the question using the context below.

    Context:
    {context}

    Question:
    {query}

    Answer:
    """
    tok, md = get_generator()
    inputs = tok(prompt, return_tensors="pt")
    outputs = md.generate(**inputs, max_length=256)
    return tok.decode(outputs[0], skip_special_tokens=True)

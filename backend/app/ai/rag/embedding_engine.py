from sentence_transformers import SentenceTransformer

model = None


def get_model():
    global model

    if model is None:
        model = SentenceTransformer('all-MiniLM-L6-v2')

    return model

def generate_embeddings(chunks):
    """
    Generate dense embeddings for a list of text chunks.
    """
    embeddings = get_model().encode(chunks)
    return embeddings

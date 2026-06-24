import numpy as np
from typing import List

try:
    from sentence_transformers import SentenceTransformer
    try:
        embedding_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
    except Exception:
        try:
            embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        except Exception:
            embedding_model = None
except Exception:
    embedding_model = None

def get_embedding(text: str) -> List[float]:
    """
    Generate float vector embedding for text. Falls back to a deterministic 384-dim mock vector.
    """
    if not text or not text.strip():
        return [0.0] * 384
        
    if embedding_model is not None:
        try:
            vector = embedding_model.encode(text)
            return vector.tolist()
        except Exception as e:
            print("Failed to compute embedding via model:", e)
            
    # Fallback deterministic vector based on character counts
    seed = sum(ord(c) for c in text)
    np.random.seed(seed % (2**32 - 1))
    vector = np.random.normal(0, 1, 384).tolist()
    return vector

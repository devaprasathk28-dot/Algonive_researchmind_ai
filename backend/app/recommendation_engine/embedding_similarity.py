import json
import logging
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from app.database import models

logger = logging.getLogger(__name__)

# Use all-mpnet-base-v2 for high quality research matching, fallback if offline or restricted
try:
    model = SentenceTransformer("all-mpnet-base-v2")
except Exception as e:
    logger.warning(f"Failed to load sentence transformer 'all-mpnet-base-v2': {e}. Falling back to 'all-MiniLM-L6-v2'")
    model = SentenceTransformer("all-MiniLM-L6-v2")

def get_or_create_embedding(paper_id: int, text: str, db: Session = None) -> list:
    """
    Retrieve cached embedding from database or compute and save it.
    """
    if db and paper_id:
        db_emb = db.query(models.PaperEmbedding).filter(models.PaperEmbedding.paper_id == paper_id).first()
        if db_emb:
            try:
                return json.loads(db_emb.embedding_json)
            except Exception as e:
                logger.error(f"Error parsing cached embedding JSON: {e}")

    # Compute embedding on the fly
    emb = model.encode(text).tolist()

    if db and paper_id:
        # Cache in database
        try:
            # Delete any existing duplicate just in case
            db.query(models.PaperEmbedding).filter(models.PaperEmbedding.paper_id == paper_id).delete()
            db_emb = models.PaperEmbedding(
                paper_id=paper_id,
                embedding_json=json.dumps(emb)
            )
            db.add(db_emb)
            db.commit()
            db.refresh(db_emb)
        except Exception as e:
            logger.error(f"Failed to cache paper embedding: {e}")
            db.rollback()

    return emb

def calculate_embedding_similarity(emb1: list, emb2: list) -> float:
    """
    Compute cosine similarity between two embeddings.
    """
    if not emb1 or not emb2:
        return 0.0
    import numpy as np
    v1 = np.array(emb1).reshape(1, -1)
    v2 = np.array(emb2).reshape(1, -1)
    sim = cosine_similarity(v1, v2)[0][0]
    return float(sim)

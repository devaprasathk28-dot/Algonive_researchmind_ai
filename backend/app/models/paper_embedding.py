from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime
from datetime import datetime
from app.database.connection import Base
from sqlalchemy.orm import relationship

class PaperEmbedding(Base):
    __tablename__ = "paper_embeddings"

    id = Column(Integer, primary_key=True)
    paper_id = Column(Integer, ForeignKey("papers.id", ondelete="CASCADE"), unique=True)
    embedding_json = Column(Text, nullable=False) # JSON-serialized float array
    created_at = Column(DateTime, default=datetime.utcnow)

    # Optional backref connection
    paper = relationship("Paper", back_populates="embedding_record")

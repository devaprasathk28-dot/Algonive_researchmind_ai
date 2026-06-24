from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database.connection import Base

class ResearchMemory(Base):
    __tablename__ = "research_memory"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=True)
    memory_type = Column(String(100))  # PAPER, SUMMARY, CRITIQUE, ENTITY, GRAPH, RECOMMENDATION, LITERATURE_REVIEW, RESEARCH_GAP
    content = Column(Text)
    embedding = Column(Text)  # JSON representation of the float vector list
    created_at = Column(DateTime, default=datetime.utcnow)

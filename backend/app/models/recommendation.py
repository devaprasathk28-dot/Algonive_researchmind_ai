from sqlalchemy import Column, Integer, Text, ForeignKey, Float, DateTime
from app.database.connection import Base
from sqlalchemy.orm import relationship
from datetime import datetime

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True)
    paper_id = Column(Integer, ForeignKey("papers.id", ondelete="CASCADE"))

    recommended_paper = Column(Text) # Title of the recommended paper
    score = Column(Float)
    reason = Column(Text) # JSON serialized list of reason strings
    
    # Store aggregated discovery aspects on the parent paper
    datasets = Column(Text) # JSON list
    models = Column(Text) # JSON list
    topics = Column(Text) # JSON list
    research_gaps = Column(Text) # JSON list

    created_at = Column(DateTime, default=datetime.utcnow)

    paper = relationship("Paper", back_populates="recommendation_records")

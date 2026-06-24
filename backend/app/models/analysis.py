from sqlalchemy import Column, Integer, ForeignKey, Float, DateTime, Text
from datetime import datetime
from app.database.connection import Base
from sqlalchemy.orm import relationship

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(
        Integer,
        primary_key=True
    )

    paper_id = Column(
        Integer,
        ForeignKey("papers.id")
    )

    novelty = Column(Float)

    clarity = Column(Float)

    technical_depth = Column(Float)

    innovation = Column(Float)

    reproducibility = Column(Float)

    dataset_quality = Column(Float)

    research_health = Column(Float)

    page_count = Column(Integer)

    word_count = Column(Integer)

    reading_time = Column(Integer)

    reference_count = Column(Integer)

    figure_count = Column(Integer)

    table_count = Column(Integer)

    equation_count = Column(Integer)

    complexity_score = Column(Float)

    technical_density = Column(Float)

    document_intelligence = Column(Float)

    # Step 35: Evidence-Based Scoring Columns
    novelty_score = Column(Float)
    novelty_reason = Column(Text)
    clarity_score = Column(Float)
    clarity_reason = Column(Text)
    innovation_score = Column(Float)
    innovation_reason = Column(Text)
    technical_score = Column(Float)
    technical_reason = Column(Text)
    reproducibility_score = Column(Float)
    reproducibility_reason = Column(Text)
    dataset_quality_score = Column(Float)
    dataset_quality_reason = Column(Text)
    confidence_score = Column(Float)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    paper = relationship("Paper", back_populates="analysis_new")


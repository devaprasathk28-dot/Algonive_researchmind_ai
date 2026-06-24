from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database.connection import Base
from sqlalchemy.orm import relationship

class Classification(Base):
    __tablename__ = "classifications"

    id = Column(
        Integer,
        primary_key=True
    )

    paper_id = Column(
        Integer,
        ForeignKey("papers.id")
    )

    domain = Column(
        String(255)
    )

    category = Column(
        String(255)
    )

    sub_category = Column(
        String(255)
    )

    complexity = Column(
        String(100)
    )

    industry_relevance = Column(
        String(100)
    )

    research_type = Column(
        String(255)
    )

    confidence = Column(
        Float
    )

    paper = relationship("Paper", back_populates="classifications")

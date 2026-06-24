from sqlalchemy import Column, Integer, String, ForeignKey
from app.database.connection import Base
from sqlalchemy.orm import relationship

class Entity(Base):
    __tablename__ = "entities"

    id = Column(
        Integer,
        primary_key=True
    )

    paper_id = Column(
        Integer,
        ForeignKey("papers.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    name = Column(
        String(255),
        index=True
    )

    entity_type = Column(
        String(100),
        index=True
    )

    frequency = Column(
        Integer,
        default=1
    )

    paper = relationship("Paper", back_populates="entities_relation")

from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from app.database.connection import Base
from sqlalchemy.orm import relationship
from datetime import datetime

class KnowledgeGraph(Base):
    __tablename__ = "knowledge_graphs"

    id = Column(
        Integer,
        primary_key=True
    )

    paper_id = Column(
        Integer,
        ForeignKey("papers.id")
    )

    nodes_json = Column(Text)

    edges_json = Column(Text)

    entity_count = Column(Integer)

    relation_count = Column(Integer)

    graph_metrics = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    paper = relationship("Paper", back_populates="knowledge_graphs")


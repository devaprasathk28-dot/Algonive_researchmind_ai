from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Table
from datetime import datetime
from app.database.connection import Base
from sqlalchemy.orm import relationship

# Many-to-Many Association Table
collection_papers = Table(
    "collection_papers",
    Base.metadata,
    Column("collection_id", Integer, ForeignKey("research_collections.id", ondelete="CASCADE"), primary_key=True),
    Column("paper_id", Integer, ForeignKey("papers.id", ondelete="CASCADE"), primary_key=True)
)

class ResearchCollection(Base):
    __tablename__ = "research_collections"

    id = Column(Integer, primary_key=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    papers = relationship("Paper", secondary=collection_papers, back_populates="collections")

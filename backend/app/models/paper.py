from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base

class Paper(Base):
    __tablename__ = "papers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(500)
    )

    authors = Column(
        Text
    )

    abstract = Column(
        Text
    )

    pdf_path = Column(
        String(1000)
    )

    summary = Column(
        Text
    )

    critique = Column(
        Text
    )

    future_work = Column(
        Text
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    workspace_id = Column(
        Integer,
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Compatibility/existing fields to prevent breaking changes:
    file_path = Column(Text)
    full_text = Column(Text)
    status = Column(String(50), default="completed", index=True)
    report_path = Column(Text)

    # Relationships
    user = relationship(
        "User",
        back_populates="papers"
    )
    workspace = relationship(
        "Workspace",
        back_populates="papers"
    )
    analysis = relationship(
        "PaperAnalysis",
        back_populates="paper",
        uselist=False,
        cascade="all, delete-orphan"
    )
    analysis_new = relationship(
        "Analysis",
        back_populates="paper",
        uselist=False,
        cascade="all, delete-orphan"
    )
    chat_history = relationship(
        "ChatHistory",
        back_populates="paper",
        cascade="all, delete-orphan"
    )
    files = relationship(
        "FileMetadata",
        back_populates="paper",
        cascade="all, delete-orphan"
    )
    classifications = relationship(
        "Classification",
        back_populates="paper",
        cascade="all, delete-orphan"
    )
    knowledge_graphs = relationship(
        "KnowledgeGraph",
        back_populates="paper",
        cascade="all, delete-orphan"
    )
    recommendation_records = relationship(
        "Recommendation",
        back_populates="paper",
        cascade="all, delete-orphan"
    )
    embedding_record = relationship(
        "PaperEmbedding",
        back_populates="paper",
        uselist=False,
        cascade="all, delete-orphan"
    )
    entities_relation = relationship(
        "Entity",
        back_populates="paper",
        cascade="all, delete-orphan"
    )
    collections = relationship(
        "ResearchCollection",
        secondary="collection_papers",
        back_populates="papers"
    )

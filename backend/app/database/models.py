from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey
)
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.connection import Base
from app.models.paper import Paper
from app.models.analysis import Analysis
from app.models.classification import Classification
from app.models.knowledge_graph import KnowledgeGraph
from app.models.recommendation import Recommendation
from app.models.entity import Entity
from app.models.paper_embedding import PaperEmbedding
from app.models.research_collection import ResearchCollection
from app.models.research_memory import ResearchMemory

ResearchPaper = Paper


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    name = Column(
        String(200)
    )
    email = Column(
        String(255),
        unique=True,
        index=True
    )
    password_hash = Column(
        String(500)
    )
    is_active = Column(
        Boolean,
        default=True
    )

    # Relationships
    papers = relationship(
        "Paper",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    chat_history = relationship(
        "ChatHistory",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    workspaces = relationship(
        "Workspace",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    followed_topics = relationship(
        "FollowedTopic",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    followed_authors = relationship(
        "FollowedAuthor",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    interests = relationship(
        "UserInterest",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name = Column(
        String(255),
        nullable=False
    )
    description = Column(
        Text,
        nullable=True
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="workspaces")
    papers = relationship(
        "Paper",
        back_populates="workspace",
        cascade="all, delete-orphan"
    )


# Deleted redundant ResearchPaper class mapping as it is replaced by Paper.


class FileMetadata(Base):
    __tablename__ = "file_metadata"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    paper_id = Column(
        Integer,
        ForeignKey("papers.id", ondelete="CASCADE"),
        nullable=False
    )
    file_name = Column(
        String(500)
    )
    file_size = Column(
        Integer
    )
    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Relationships
    paper = relationship(
        "Paper",
        back_populates="files"
    )


class PaperAnalysis(Base):
    __tablename__ = "paper_analysis"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    paper_id = Column(
        Integer,
        ForeignKey("papers.id", ondelete="CASCADE"),
        nullable=False
    )
    novelty = Column(
        String(50)
    )
    clarity = Column(
        String(50)
    )
    innovation = Column(
        String(50)
    )
    technical_depth = Column(
        String(50)
    )

    # Relationships
    paper = relationship(
        "Paper",
        back_populates="analysis"
    )


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    paper_id = Column(
        Integer,
        ForeignKey("papers.id", ondelete="CASCADE"),
        nullable=False
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True
    )
    question = Column(
        Text
    )
    answer = Column(
        Text
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Relationships
    paper = relationship(
        "Paper",
        back_populates="chat_history"
    )
    user = relationship(
        "User",
        back_populates="chat_history"
    )


class FollowedTopic(Base):
    __tablename__ = "followed_topics"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    topic_name = Column(
        String(255),
        nullable=False
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="followed_topics")


class FollowedAuthor(Base):
    __tablename__ = "followed_authors"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    author_name = Column(
        String(255),
        nullable=False
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="followed_authors")


class UserInterest(Base):
    __tablename__ = "user_interests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    topic = Column(
        String(255),
        nullable=False
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="interests")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title = Column(
        String(500),
        nullable=False
    )
    message = Column(
        Text,
        nullable=False
    )
    is_read = Column(
        Boolean,
        default=False
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="notifications")



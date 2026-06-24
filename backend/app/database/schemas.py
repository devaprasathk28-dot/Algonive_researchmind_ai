from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str


class ChatHistoryBase(BaseModel):
    question: str
    answer: str

class ChatHistoryCreate(ChatHistoryBase):
    paper_id: int

class ChatHistory(ChatHistoryBase):
    id: int
    paper_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PaperAnalysisBase(BaseModel):
    novelty: str
    clarity: str
    innovation: str
    technical_depth: str

class PaperAnalysisCreate(PaperAnalysisBase):
    paper_id: int

class PaperAnalysis(PaperAnalysisBase):
    id: int
    paper_id: int

    class Config:
        from_attributes = True


class FileMetadataBase(BaseModel):
    file_name: str
    file_size: int

class FileMetadataCreate(FileMetadataBase):
    paper_id: int

class FileMetadata(FileMetadataBase):
    id: int
    paper_id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


class ResearchPaperBase(BaseModel):
    title: str
    authors: str
    abstract: str
    full_text: Optional[str] = None
    summary: Optional[str] = None
    critique: Optional[str] = None
    file_path: Optional[str] = None
    status: Optional[str] = "completed"
    report_path: Optional[str] = None
    workspace_id: Optional[int] = None


class ResearchPaperCreate(ResearchPaperBase):
    pass

class ResearchPaper(ResearchPaperBase):
    id: int
    created_at: datetime
    analysis: Optional[PaperAnalysis] = None
    chat_history: List[ChatHistory] = []
    files: List[FileMetadata] = []

    class Config:
        from_attributes = True


class WorkspaceBase(BaseModel):
    name: str
    description: Optional[str] = None

class WorkspaceCreate(WorkspaceBase):
    pass

class Workspace(WorkspaceBase):
    id: int
    user_id: int
    created_at: datetime
    papers: List[ResearchPaper] = []

    class Config:
        from_attributes = True


class FollowedTopicBase(BaseModel):
    topic_name: str

class FollowedTopicCreate(FollowedTopicBase):
    pass

class FollowedTopic(FollowedTopicBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class FollowedAuthorBase(BaseModel):
    author_name: str

class FollowedAuthorCreate(FollowedAuthorBase):
    pass

class FollowedAuthor(FollowedAuthorBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserInterestBase(BaseModel):
    topic: str

class UserInterestCreate(UserInterestBase):
    pass

class UserInterest(UserInterestBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationBase(BaseModel):
    title: str
    message: str

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True





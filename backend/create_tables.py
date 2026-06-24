from app.database.connection import engine, Base
from app.database.models import User, ResearchPaper, FileMetadata, PaperAnalysis, ChatHistory, FollowedTopic, FollowedAuthor, UserInterest, Notification, Analysis, Classification, KnowledgeGraph, Recommendation, Entity

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

print("Database tables created.")

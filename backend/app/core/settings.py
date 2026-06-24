from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    DATABASE_URL: Optional[str] = None
    JWT_SECRET: str = "researchmind-secret-key"
    HF_TOKEN: Optional[str] = ""
    CHROMA_PATH: str = "chroma_db"
    REDIS_URL: str = "redis://localhost:6379/0"
    ENVIRONMENT: str = "production"
    CORS_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

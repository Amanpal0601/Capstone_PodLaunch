import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PodLaunch Serverless Platform"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # Supabase Connection Settings
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    DATABASE_URL: Optional[str] = None

    # Local PostgreSQL Fallback Settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "podlaunch_user"
    POSTGRES_PASSWORD: str = "podlaunch_secret"
    POSTGRES_DB: str = "podlaunch_db"

    # Clerk Auth Backend Keys
    CLERK_PUBLISHABLE_KEY: Optional[str] = None
    CLERK_SECRET_KEY: Optional[str] = None

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            # Ensure asyncpg dialect is used if standard postgresql:// prefix is given
            db_uri = self.DATABASE_URL
            if db_uri.startswith("postgresql://"):
                db_uri = db_uri.replace("postgresql://", "postgresql+asyncpg://", 1)
            elif db_uri.startswith("postgres://"):
                db_uri = db_uri.replace("postgres://", "postgresql+asyncpg://", 1)
            return db_uri
        
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Docker Defaults
    DEFAULT_MEMORY_LIMIT_MB: int = 128
    DEFAULT_CPU_QUOTA: float = 0.5
    DEFAULT_PID_LIMIT: int = 64
    DEFAULT_TIMEOUT_SECONDS: float = 5.0

    # Pooling Defaults
    DEFAULT_STRATEGY: str = "PREDICTIVE_PRE_WARM"
    KEEP_ALIVE_TTL_SECONDS: float = 30.0
    FIXED_PREWARM_WATERMARK: int = 2
    PREDICTIVE_BUCKET_MINUTES: int = 5

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()

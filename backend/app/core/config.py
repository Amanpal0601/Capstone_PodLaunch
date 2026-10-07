from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "PodLaunch Serverless Platform"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # Database Settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "podlaunch_user"
    POSTGRES_PASSWORD: str = "podlaunch_secret"
    POSTGRES_DB: str = "podlaunch_db"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
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

settings = Settings()

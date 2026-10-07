import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class FunctionModel(Base):
    __tablename__ = "functions"

    name = Column(String(128), primary_key=True, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    versions = relationship("FunctionVersionModel", back_populates="function", cascade="all, delete-orphan")


class FunctionVersionModel(Base):
    __tablename__ = "function_versions"

    id = Column(String(64), primary_key=True, default=lambda: f"v_{uuid.uuid4().hex[:12]}")
    function_name = Column(String(128), ForeignKey("functions.name", ondelete="CASCADE"), nullable=False)
    version_hash = Column(String(64), nullable=False)
    runtime = Column(String(32), nullable=False, default="python3.11")
    entry_point = Column(String(128), nullable=False)
    memory_limit_mb = Column(Integer, default=128)
    timeout_seconds = Column(Float, default=5.0)
    image_tag = Column(String(256), nullable=False)
    build_status = Column(String(32), default="Ready") # Pending, Building, Ready, Failed
    env_vars = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    function = relationship("FunctionModel", back_populates="versions")


class InvocationLogModel(Base):
    __tablename__ = "invocation_logs"

    request_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    function_name = Column(String(128), index=True, nullable=False)
    version = Column(String(32), nullable=False)
    cold_start = Column(Boolean, nullable=False)
    strategy = Column(String(32), nullable=False)
    startup_ms = Column(Float, default=0.0)
    execution_ms = Column(Float, default=0.0)
    total_time_ms = Column(Float, default=0.0)
    queue_wait_time_ms = Column(Float, default=0.0)
    error_type = Column(String(32), default="NONE")
    idle_memory_mb = Column(Float, default=0.0)
    container_id = Column(String(64), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

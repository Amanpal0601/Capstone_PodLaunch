import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON, BigInteger, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class UserModel(Base):
    """
    Users table representing Clerk authenticated identities.
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_id = Column(String(128), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    role = Column(String(64), default="researcher")
    user_metadata = Column("metadata", JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    functions = relationship("FunctionModel", back_populates="user", cascade="all, delete-orphan")
    invocations = relationship("InvocationLogModel", back_populates="user", cascade="all, delete-orphan")


class FunctionModel(Base):
    """
    Serverless function entity belonging to a user.
    """
    __tablename__ = "functions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_id = Column(String(128), ForeignKey("users.clerk_id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(128), nullable=False, index=True)
    description = Column(Text, nullable=True)
    default_runtime = Column(String(32), nullable=False, default="python3.11")
    default_entry_point = Column(String(128), nullable=False, default="handler.handler")
    default_memory_mb = Column(Integer, default=128)
    default_timeout_sec = Column(Float, default=5.0)
    concurrency_limit = Column(Integer, default=10)
    total_invocations = Column(BigInteger, default=0)
    avg_duration_ms = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("clerk_id", "name", name="uq_user_function_name"),
    )

    # Relationships
    user = relationship("UserModel", back_populates="functions")
    versions = relationship("FunctionVersionModel", back_populates="function", cascade="all, delete-orphan")
    invocations = relationship("InvocationLogModel", back_populates="function", cascade="all, delete-orphan")


class FunctionVersionModel(Base):
    """
    Immutable content-hash versioned artifact.
    """
    __tablename__ = "function_versions"

    id = Column(String(64), primary_key=True, default=lambda: f"v_{uuid.uuid4().hex[:12]}")
    function_id = Column(UUID(as_uuid=True), ForeignKey("functions.id", ondelete="CASCADE"), nullable=False, index=True)
    function_name = Column(String(128), nullable=False)
    clerk_id = Column(String(128), ForeignKey("users.clerk_id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(String(32), default="v1.0.0")
    version_hash = Column(String(64), nullable=False, index=True) # Deterministic SHA-256
    runtime = Column(String(32), nullable=False, default="python3.11")
    entry_point = Column(String(128), nullable=False)
    code_payload = Column(Text, nullable=False)
    memory_limit_mb = Column(Integer, default=128)
    cpu_quota = Column(Float, default=0.5)
    timeout_seconds = Column(Float, default=5.0)
    image_tag = Column(String(256), nullable=False)
    build_status = Column(String(32), default="Ready") # Pending, Building, Ready, Failed
    build_logs = Column(Text, nullable=True)
    env_vars = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    function = relationship("FunctionModel", back_populates="versions")
    invocations = relationship("InvocationLogModel", back_populates="version")


class InvocationLogModel(Base):
    """
    High-throughput time-series telemetry record for cold-start research evaluation.
    """
    __tablename__ = "invocation_logs"

    request_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    function_id = Column(UUID(as_uuid=True), ForeignKey("functions.id", ondelete="CASCADE"), nullable=True)
    function_name = Column(String(128), index=True, nullable=False)
    version_id = Column(String(64), ForeignKey("function_versions.id", ondelete="SET NULL"), nullable=True)
    clerk_id = Column(String(128), ForeignKey("users.clerk_id", ondelete="CASCADE"), nullable=False, index=True)
    strategy = Column(String(32), nullable=False) # NAIVE, KEEP_ALIVE, FIXED_PRE_WARM, PREDICTIVE_PRE_WARM
    cold_start = Column(Boolean, nullable=False)
    startup_ms = Column(Float, default=0.0)
    execution_ms = Column(Float, default=0.0)
    total_time_ms = Column(Float, default=0.0)
    queue_wait_time_ms = Column(Float, default=0.0)
    idle_memory_mb = Column(Float, default=0.0)
    container_id = Column(String(64), nullable=False)
    status = Column(String(32), default="SUCCESS")
    error_type = Column(String(32), default="NONE")
    error_message = Column(Text, nullable=True)
    time_bucket_5m = Column(Integer, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("UserModel", back_populates="invocations")
    function = relationship("FunctionModel", back_populates="invocations")
    version = relationship("FunctionVersionModel", back_populates="invocations")

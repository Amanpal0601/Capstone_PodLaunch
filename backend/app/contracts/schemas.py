from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field

class ErrorType(str, Enum):
    NONE = "NONE"
    FUNCTION_ERROR = "FUNCTION_ERROR"
    TIMEOUT = "TIMEOUT"
    MEMORY_LIMIT = "MEMORY_LIMIT"
    SANDBOX_ERROR = "SANDBOX_ERROR"

class StrategyEnum(str, Enum):
    NAIVE = "NAIVE"
    KEEP_ALIVE = "KEEP_ALIVE"
    FIXED_PRE_WARM = "FIXED_PRE_WARM"
    PREDICTIVE_PRE_WARM = "PREDICTIVE_PRE_WARM"

class RuntimeEnum(str, Enum):
    PYTHON311 = "python3.11"
    NODE18 = "node18"

class ContainerStateEnum(str, Enum):
    WARM_IDLE = "WARM_IDLE"
    ACTIVE_RUNNING = "ACTIVE_RUNNING"
    INITIALIZING = "INITIALIZING"
    TERMINATED = "TERMINATED"

class ContainerInfo(BaseModel):
    id: str
    function_name: str
    version: str
    state: ContainerStateEnum
    memory_mb: int
    ttl_remaining_sec: int
    invocations_served: int
    created_at: datetime

# =============================================================================
# USER SCHEMAS (Clerk Integration)
# =============================================================================
class UserProfile(BaseModel):
    clerk_id: str = Field(..., description="Unique Clerk User ID, e.g. user_2t...")
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str = "researcher"
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class UserProfileResponse(UserProfile):
    id: UUID
    created_at: datetime
    updated_at: datetime

# =============================================================================
# FUNCTION & VERSION SCHEMAS
# =============================================================================
class FunctionCreate(BaseModel):
    name: str = Field(..., example="image-thumbnail-resizer")
    clerk_id: str = Field(default="user_default", description="Clerk ID of the function owner")
    runtime: RuntimeEnum = Field(default=RuntimeEnum.PYTHON311)
    entry_point: str = Field(default="handler.process_image")
    code: str = Field(..., description="Source code text or bundle payload")
    memory_limit_mb: int = Field(default=128, ge=64, le=1024)
    timeout_seconds: float = Field(default=5.0, ge=0.5, le=30.0)
    description: Optional[str] = None
    env_vars: Optional[Dict[str, str]] = Field(default_factory=dict)

class FunctionVersionResponse(BaseModel):
    id: str
    function_name: str
    clerk_id: str
    version_number: str
    version_hash: str
    runtime: str
    entry_point: str
    memory_limit_mb: int
    timeout_seconds: float
    image_tag: str
    build_status: str
    created_at: datetime

class FunctionResponse(BaseModel):
    id: Optional[UUID] = None
    name: str
    clerk_id: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    latest_version: Optional[FunctionVersionResponse] = None
    total_invocations: int = 0
    avg_duration_ms: float = 0.0

# =============================================================================
# INVOCATION & EXECUTION SCHEMAS
# =============================================================================
class ExecutionRequest(BaseModel):
    request_id: UUID = Field(default_factory=uuid4)
    function_name: str
    clerk_id: str = Field(default="user_default")
    version: Optional[str] = None
    input_data: Dict[str, Any] = Field(default_factory=dict)
    timeout_seconds: float = 5.0

class ExecutionResult(BaseModel):
    request_id: UUID
    container_id: str
    status: str                         # "SUCCESS" | "ERROR"
    result: Optional[Any] = None
    error: Optional[str] = None
    error_type: ErrorType = ErrorType.NONE
    startup_ms: float = 0.0             # Container creation / cold start latency
    execution_ms: float = 0.0           # Active payload run duration
    total_time_ms: float = 0.0          # Complete end-to-end sandbox time
    oom_killed: bool = False

class ResponseEnvelope(BaseModel):
    status: str                         # "SUCCESS" | "ERROR"
    result: Optional[Any] = None
    error: Optional[str] = None
    duration_ms: float
    cold_start: bool
    container_id: Optional[str] = None
    request_id: Optional[UUID] = None
    function_name: Optional[str] = None
    clerk_id: Optional[str] = None

# =============================================================================
# TELEMETRY & RESEARCH LOG SCHEMAS
# =============================================================================
class MetricRecord(BaseModel):
    request_id: UUID
    function_name: str
    clerk_id: str
    version: str
    cold_start: bool
    strategy: StrategyEnum
    startup_ms: float
    execution_ms: float
    total_time_ms: float
    queue_wait_time_ms: float
    error_type: ErrorType
    idle_memory_mb: float
    container_id: str
    time_bucket_5m: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

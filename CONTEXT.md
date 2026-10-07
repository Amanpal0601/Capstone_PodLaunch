# PodLaunch: AI & Developer Context Guide

## 1. Project Summary
PodLaunch is a lightweight, zero-cloud-cost, self-managed serverless function platform focused on cold-start optimization. Functions (Python 3.11, Node 18) are packaged into isolated Docker containers and executed on-demand locally. The core research deliverable is an empirical comparison of four container pooling strategies (Naive, Keep-Alive, Fixed Pre-Warm, Predictive Pre-Warm) against cold-start latency (single-digit ms warm vs 100s ms cold), p99 latency, and idle memory overhead under steady, bursty (Poisson), and periodic traffic, benchmarked against local OpenFaaS and Knative.

---

## 2. Glossary
- **Cold Start:** Full container lifecycle creation, startup, and code loading before execution.
- **Warm Start:** Immediate execution using an existing, idle container in the pool.
- **Pool Manager:** Subsystem managing container lifecycle, inventory, and pooling strategy.
- **Strategy:** Pluggable policy deciding container creation, TTL, and pre-warming.
- **Correlation ID (UUID4):** Unique request identifier assigned at API ingress, tracked across all logs.
- **ExecutionResult:** Standardized data struct returned by Sandbox after container execution.
- **Response Envelope:** Uniform JSON response shape returned by the Invocation API.

---

## 3. Module Map & Ownership
| Module | Folder Path | Owner | Primary Role |
| :--- | :--- | :--- | :--- |
| **Registry & API** | `registry/`, `api/` | Aman Pal | Packaging, Dockerfiles, metadata DB, FastAPI endpoints |
| **Scheduler** | `scheduler/` | Aryan Arora | FIFO queue, concurrency limiter, request dispatcher |
| **Pool Manager** | `pool/` | Tanishk Tiwari | 4 pooling strategies, `acquire`/`release`, TTL reaper |
| **Sandbox** | `sandbox/` | Harsh Aggarwal | Docker lifecycle (`docker-py`), cgroups, error taxonomy |
| **Metrics & Load** | `metrics/`, `benchmarks/`| Rhythm Dhangar | Workloads (Poisson/bursty), k6 harnesses, async telemetry |
| **Dashboard** | `dashboard/` | Rhythm Dhangar | React real-time telemetry frontend |
| **Contracts** | `contracts/` | Shared | Shared typed schemas and interface definitions |

---

## 4. The Six Shared Contracts (Signatures & Shapes)

### 1. Scheduler <-> Pool Manager Interface
- `acquire(function_name: str, version: Optional[str]) -> ContainerAcquisition(container_id, function_name, version, cold_start: bool)`
- `release(container_id: str, function_name: str, has_error: bool = False) -> None`

### 2. Pool Manager <-> Sandbox Interface
- `create(image_tag: str, memory_limit_mb: int, cpu_quota: float, pid_limit: int, network_enabled: bool) -> str (container_id)`
- `execute(container_id: str, input_data: dict, timeout_seconds: float) -> ExecutionResult`
- `destroy(container_id: str) -> None`

### 3. ExecutionRequest & ExecutionResult (Pydantic)
- `ExecutionRequest`: `{request_id: UUID, function_name: str, version: Optional[str], input_data: dict, timeout_seconds: float}`
- `ExecutionResult`: `{request_id: UUID, container_id: str, status: "SUCCESS"|"ERROR", result: Any, error: Optional[str], error_type: ErrorType, startup_ms: float, execution_ms: float, total_time_ms: float, oom_killed: bool}`

### 4. API Invocation Response Envelope
- `{status: "SUCCESS"|"ERROR", result: Any, error: Optional[str], duration_ms: float, cold_start: bool}`

### 5. Metrics Telemetry Record
- `{request_id: UUID, function_id: str, version: str, cold_start: bool, strategy: StrategyEnum, startup_ms: float, execution_ms: float, total_time_ms: float, error_type: ErrorType, queue_wait_time_ms: float, concurrency_limit_hit: bool, timestamp: datetime, idle_memory_mb: float, oom_killed: bool, container_id: str}`

### 6. Relational Database Tables (PostgreSQL / Alembic)
- `functions(name PK, description, created_at, updated_at)`
- `function_versions(id PK, function_name FK, version_hash, runtime, entry_point, memory_limit_mb, timeout_seconds, image_tag, build_status, env_vars, created_at)`
- `invocation_logs(request_id PK, function_name, version, cold_start, strategy, startup_ms, execution_ms, total_time_ms, queue_wait_time_ms, error_type, oom_killed, idle_memory_mb, container_id, timestamp)`

---

## 5. Hard Invariants & Rules
1. **API Isolation:** API never executes functions or manages Docker containers directly.
2. **Scheduler Boundaries:** Scheduler never decides container lifetime or TTL; it handles only queuing and concurrency limits.
3. **Pool Manager API:** Pool Manager only exposes `acquire` and `release`.
4. **Sandbox Decoupling:** Sandbox never contains pooling, TTL, or replenishment policies.
5. **Zero Hot-Path Metrics:** Telemetry writes must be asynchronous/buffered; never block the request path.
6. **No Host/Socket Mounts:** Never mount `/var/run/docker.sock` or host filesystems into function containers.
7. **Non-Privileged Execution:** Never run privileged containers; always enforce cgroup limits (128MB, 0.5 CPU, PID 64, network disabled).
8. **Pool Concurrency Safety:** Always guard the per-function idle container list with an `asyncio.Lock` before popping/pushing.
9. **Deterministic Benchmarks:** Workload generator must be seeded and reproducible across all strategies.
10. **Swappable Strategies:** All 4 pooling strategies must share the identical `PoolStrategy` interface without altering scheduler or sandbox code.

---

## 6. Coding Conventions & Standards
- **Runtime:** Python 3.11 exclusively.
- **Typing:** Strict type hints on all functions and class signatures.
- **Async First:** `async`/`await` for all I/O, API routes, database sessions, and queue operations.
- **Data Validation:** Use Pydantic v2 models for incoming payloads, envelopes, and internal contracts.
- **Logging:** Structured logging using `structlog`, binding `request_id` (correlation ID) to every log entry.
- **Testing:** `pytest` + `pytest-asyncio` + `httpx.AsyncClient`.
- **Development Flow:** Build stub/fake implementations of external dependencies before writing real integration code.

---

## 7. Build Order & Implementation Plan
1. **Step 1:** Define contracts in `contracts/` with Pydantic schemas.
2. **Step 2:** Build mock Sandbox executor and mock Pool Manager returning static warm/cold stubs.
3. **Step 3:** Implement Invocation API and in-memory Scheduler FIFO queue using stubs.
4. **Step 4:** Implement real Docker Sandbox (`docker-py`) and test resource limits/timeouts.
5. **Step 5:** Implement real Pool Manager starting with `NaiveStrategy` and `KeepAliveStrategy`.
6. **Step 6:** Implement Registry packaging pipeline (Dockerfile templates, SHA-256 hashing, PostgreSQL persistence).
7. **Step 7:** Implement `FixedPreWarmStrategy` and `PredictivePreWarmStrategy` with time-series history.
8. **Step 8:** Implement metrics collector, k6 benchmark harness, and React dashboard.

---

## 8. Current Status & TODOs
- **Current Milestone:** Phase 1 / Capstone Review 1 (Architecture, Contracts & Design Phase).
- **Done:** Architecture design, schema contracts, state machines, and documentation.
- **TODO:**
  - [ ] Implement `contracts/` schemas.
  - [ ] Set up `docker-compose.yml` with PostgreSQL.
  - [ ] Implement Registry Dockerfile templates for `python3.11` and `node18`.
  - [ ] Implement Sandbox runner and test container limits (T1–T6).
  - [ ] Implement Pool Manager strategies and concurrency locks.
  - [ ] Build deterministic workload generator (Poisson, steady, periodic).
  - [ ] Build React telemetry dashboard.

---

## 9. Open Questions & Team Decisions
- Exact metadata format passed from Registry to Sandbox.
- Whether Scheduler passes Docker image string or function ID to Pool Manager.
- Global platform maximum resource limits (CPU, memory, timeout).
- Internal container runner protocol (HTTP vs stdin/stdout) for Python/Node.
- Reusability of containers following a `FUNCTION_ERROR` exit.
- Queue-full error status: HTTP 429 vs HTTP 503.
- Confirmation that only Sandbox/Pool Manager touch `docker-py`.
- Corrected Queue Wait Time calculation: `handoff_timestamp - receive_timestamp`.

---

## 10. Core Directive for AI Assistants
> **CRITICAL:** When unsure about an implementation detail or interface boundary, **do NOT guess or invent contracts**. Ask the user or record it in **Open Questions**. Strictly follow the 6 shared contracts and hard invariants.

# PodLaunch Python Backend

The core control plane and execution orchestrator for **PodLaunch**, built with **Python 3.11**, **FastAPI**, **PostgreSQL**, and **Docker Engine**.

---

## 1. Directory Structure

```text
backend/
├── app/
│   ├── main.py                     # FastAPI entry point & CORS
│   ├── core/config.py              # Environment configuration & settings
│   ├── contracts/schemas.py        # Pydantic v2 typed data contracts
│   ├── db/
│   │   ├── session.py              # Async SQLAlchemy engine
│   │   └── models.py               # PostgreSQL relational models
│   ├── services/
│   │   ├── pool/                   # Research Core: Strategy Engine & Pool Manager
│   │   │   ├── pool_manager.py     # acquire() / release() lifecycle
│   │   │   └── strategies/         # Naive, Keep-Alive, Fixed, Predictive
│   │   ├── sandbox/                # Docker execution boundary & cgroups
│   │   ├── scheduler/              # In-memory FIFO queue & concurrency control
│   │   ├── registry/               # Function packaging & SHA-256 versioning
│   │   └── metrics/                # Asynchronous telemetry collector
│   └── api/v1/                     # REST API Routers
│       ├── endpoints/
│       │   ├── functions.py        # /api/v1/functions
│       │   ├── invoke.py           # /api/v1/invoke/{function_name}
│       │   ├── pool.py             # /api/v1/pool
│       │   └── telemetry.py        # /api/v1/telemetry
├── Dockerfile
├── requirements.txt
└── .env.example
```

---

## 2. Local Setup & Execution

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run development server
uvicorn app.main:app --reload --port 8000
```

- Interactive API Swagger Docs: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- ReDoc Docs: [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

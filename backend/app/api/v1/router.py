from fastapi import APIRouter
from app.api.v1.endpoints import functions, invoke, pool, telemetry

api_router = APIRouter()

api_router.include_router(functions.router, prefix="/functions", tags=["Functions"])
api_router.include_router(invoke.router, prefix="/invoke", tags=["Invocation"])
api_router.include_router(pool.router, prefix="/pool", tags=["Container Pool"])
api_router.include_router(telemetry.router, prefix="/telemetry", tags=["Telemetry & Metrics"])

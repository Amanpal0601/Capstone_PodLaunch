from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from app.api.v1.endpoints.invoke import get_telemetry, TelemetryCollector

router = APIRouter()

@router.get("/logs")
async def get_invocation_logs(limit: int = 50, tele: TelemetryCollector = Depends(get_telemetry)):
    return tele.get_recent_logs(limit=limit)

@router.get("/stats")
async def get_telemetry_stats(tele: TelemetryCollector = Depends(get_telemetry)):
    return tele.get_summary_stats()

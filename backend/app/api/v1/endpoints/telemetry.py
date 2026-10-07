from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.api.v1.endpoints.invoke import get_telemetry, TelemetryCollector
from app.db.session import get_db
from app.db.models import InvocationLogModel

router = APIRouter()

@router.get("/logs")
async def get_invocation_logs(
    limit: int = 50, 
    clerk_id: str = None,
    db: AsyncSession = Depends(get_db), 
    tele: TelemetryCollector = Depends(get_telemetry)
):
    try:
        stmt = select(InvocationLogModel).order_by(desc(InvocationLogModel.timestamp)).limit(limit)
        if clerk_id:
            stmt = stmt.where(InvocationLogModel.clerk_id == clerk_id)
        res = await db.execute(stmt)
        logs = res.scalars().all()
        if logs:
            return [
                {
                    "requestId": str(l.request_id),
                    "functionName": l.function_name,
                    "clerkId": l.clerk_id,
                    "version": l.version_id or "v1.0.0",
                    "strategy": l.strategy,
                    "coldStart": l.cold_start,
                    "durationMs": round(l.total_time_ms, 2),
                    "startupMs": round(l.startup_ms, 2),
                    "executionMs": round(l.execution_ms, 2),
                    "queueWaitMs": round(l.queue_wait_time_ms, 2),
                    "status": l.status,
                    "errorType": l.error_type,
                    "containerId": l.container_id,
                    "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S")
                }
                for l in logs
            ]
    except Exception as e:
        print(f"[Supabase DB Logs Warning] {e}")

    return tele.get_recent_logs(limit=limit)

@router.get("/stats")
async def get_telemetry_stats(
    clerk_id: str = None,
    db: AsyncSession = Depends(get_db),
    tele: TelemetryCollector = Depends(get_telemetry)
):
    try:
        stmt = select(InvocationLogModel)
        if clerk_id:
            stmt = stmt.where(InvocationLogModel.clerk_id == clerk_id)
        res = await db.execute(stmt)
        logs = res.scalars().all()
        if logs:
            total = len(logs)
            cold_starts = sum(1 for l in logs if l.cold_start)
            durations = sorted([l.total_time_ms for l in logs])

            p50_idx = int(0.50 * total)
            p90_idx = int(0.90 * total)
            p99_idx = min(int(0.99 * total), total - 1)

            return {
                "total_invocations": total,
                "cold_start_rate": round((cold_starts / total) * 100, 1),
                "p50_duration_ms": round(durations[p50_idx], 2),
                "p90_duration_ms": round(durations[p90_idx], 2),
                "p99_duration_ms": round(durations[p99_idx], 2)
            }
    except Exception as e:
        print(f"[Supabase DB Stats Warning] {e}")

    return tele.get_summary_stats()

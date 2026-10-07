import time
import uuid
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from app.contracts.schemas import ResponseEnvelope
from app.api.v1.endpoints.functions import FUNCTIONS_DB
from app.services.sandbox.docker_sandbox import DockerSandbox
from app.services.pool.pool_manager import PoolManager
from app.services.metrics.telemetry import TelemetryCollector

router = APIRouter()

# Global singletons
sandbox = DockerSandbox()
pool_manager = PoolManager(sandbox)
telemetry = TelemetryCollector()

def get_pool_manager():
    return pool_manager

def get_telemetry():
    return telemetry

@router.post("/{function_name}", response_model=ResponseEnvelope)
async def invoke_function(
    function_name: str, 
    payload: Dict[str, Any],
    pool: PoolManager = Depends(get_pool_manager),
    tele: TelemetryCollector = Depends(get_telemetry)
):
    if function_name not in FUNCTIONS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Function '{function_name}' not found."
        )

    fn_data = FUNCTIONS_DB[function_name]
    latest_version = fn_data["latest_version"]

    start_wall_clock = time.time()
    req_id = uuid.uuid4()

    # 1. Acquire container from Pool Manager (Research Core)
    acquisition = await pool.acquire(function_name, latest_version)

    # 2. Execute payload in Sandbox
    exec_result = await sandbox.execute(
        container_id=acquisition.container_id,
        input_data=payload,
        timeout_seconds=latest_version.get("timeout_seconds", 5.0)
    )

    # 3. Release container
    has_error = exec_result.status == "ERROR"
    await pool.release(acquisition.container_id, function_name, has_error=has_error)

    total_duration_ms = (time.time() - start_wall_clock) * 1000

    # 4. Async Telemetry
    tele.record_invocation({
        "requestId": str(req_id),
        "functionName": function_name,
        "version": latest_version.get("id", "v1.0"),
        "coldStart": acquisition.cold_start,
        "strategy": pool.active_strategy.value,
        "durationMs": round(total_duration_ms, 2),
        "startupMs": round(exec_result.startup_ms, 2),
        "executionMs": round(exec_result.execution_ms, 2),
        "status": exec_result.status,
        "containerId": acquisition.container_id,
        "timestamp": "Just now"
    })

    # Update function stats
    fn_data["invocations_count"] += 1
    fn_data["avg_duration_ms"] = round(((fn_data["avg_duration_ms"] * (fn_data["invocations_count"] - 1) + total_duration_ms) / fn_data["invocations_count"]), 2)

    return ResponseEnvelope(
        status=exec_result.status,
        result=exec_result.result,
        error=exec_result.error,
        duration_ms=round(total_duration_ms, 2),
        cold_start=acquisition.cold_start,
        container_id=acquisition.container_id,
        request_id=req_id
    )

import time
import uuid
from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.contracts.schemas import ResponseEnvelope
from app.api.v1.endpoints.functions import FUNCTIONS_DB
from app.services.sandbox.docker_sandbox import DockerSandbox
from app.services.pool.pool_manager import PoolManager
from app.services.metrics.telemetry import TelemetryCollector
from app.db.session import get_db
from app.db.models import FunctionModel, FunctionVersionModel, InvocationLogModel

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
    clerk_id: str = "user_group22_lead_amanpal",
    db: AsyncSession = Depends(get_db),
    pool: PoolManager = Depends(get_pool_manager),
    tele: TelemetryCollector = Depends(get_telemetry)
):
    # 1. Resolve function metadata from Supabase
    fn_id = None
    ver_id = None
    timeout_sec = 5.0
    mem_mb = 128
    image_tag = f"podlaunch/{function_name}:latest"

    try:
        stmt = select(FunctionModel).where(FunctionModel.name == function_name)
        res = await db.execute(stmt)
        fn_obj = res.scalars().first()

        if fn_obj:
            fn_id = fn_obj.id
            timeout_sec = fn_obj.default_timeout_sec
            mem_mb = fn_obj.default_memory_mb
            clerk_id = fn_obj.clerk_id

            v_stmt = select(FunctionVersionModel).where(FunctionVersionModel.function_id == fn_id).order_by(FunctionVersionModel.created_at.desc()).limit(1)
            v_res = await db.execute(v_stmt)
            ver_obj = v_res.scalars().first()
            if ver_obj:
                ver_id = ver_obj.id
                image_tag = ver_obj.image_tag
                timeout_sec = ver_obj.timeout_seconds
                mem_mb = ver_obj.memory_limit_mb
    except Exception as e:
        print(f"[Supabase DB Query Warning] {e}")

    version_metadata = {
        "id": ver_id or "v_default",
        "image_tag": image_tag,
        "memory_limit_mb": mem_mb,
        "timeout_seconds": timeout_sec
    }

    start_wall_clock = time.time()
    req_id = uuid.uuid4()

    # 2. Acquire container from Pool Manager (Research Core)
    acquisition = await pool.acquire(function_name, version_metadata)

    # 3. Execute payload in Sandbox
    exec_result = await sandbox.execute(
        container_id=acquisition.container_id,
        input_data=payload,
        timeout_seconds=timeout_sec
    )

    # 4. Release container back to strategy pool
    has_error = exec_result.status == "ERROR"
    await pool.release(acquisition.container_id, function_name, has_error=has_error)

    total_duration_ms = (time.time() - start_wall_clock) * 1000

    # 5. Persist invocation record in Supabase
    try:
        log_entry = InvocationLogModel(
            request_id=req_id,
            function_id=fn_id,
            function_name=function_name,
            version_id=ver_id,
            clerk_id=clerk_id,
            strategy=pool.active_strategy.value,
            cold_start=acquisition.cold_start,
            startup_ms=exec_result.startup_ms,
            execution_ms=exec_result.execution_ms,
            total_time_ms=total_duration_ms,
            queue_wait_time_ms=0.8,
            idle_memory_mb=float(acquisition.memory_mb),
            container_id=acquisition.container_id,
            status=exec_result.status,
            error_type=exec_result.error_type.value,
            error_message=exec_result.error,
            timestamp=datetime.utcnow()
        )
        db.add(log_entry)

        if fn_id:
            await db.execute(
                update(FunctionModel)
                .where(FunctionModel.id == fn_id)
                .values(
                    total_invocations=FunctionModel.total_invocations + 1,
                    avg_duration_ms=((FunctionModel.avg_duration_ms * FunctionModel.total_invocations + total_duration_ms) / (FunctionModel.total_invocations + 1))
                )
            )
        await db.commit()
    except Exception as e:
        print(f"[Supabase Log Error] {e}")
        await db.rollback()

    # 6. In-memory Telemetry stream
    tele.record_invocation({
        "requestId": str(req_id),
        "functionName": function_name,
        "clerkId": clerk_id,
        "version": ver_id or "v1.0",
        "coldStart": acquisition.cold_start,
        "strategy": pool.active_strategy.value,
        "durationMs": round(total_duration_ms, 2),
        "startupMs": round(exec_result.startup_ms, 2),
        "executionMs": round(exec_result.execution_ms, 2),
        "status": exec_result.status,
        "containerId": acquisition.container_id,
        "timestamp": "Just now"
    })

    return ResponseEnvelope(
        status=exec_result.status,
        result=exec_result.result,
        error=exec_result.error,
        duration_ms=round(total_duration_ms, 2),
        cold_start=acquisition.cold_start,
        container_id=acquisition.container_id,
        request_id=req_id,
        function_name=function_name,
        clerk_id=clerk_id
    )

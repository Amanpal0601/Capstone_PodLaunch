import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.contracts.schemas import FunctionCreate, FunctionResponse, FunctionVersionResponse
from app.services.registry.hasher import compute_function_hash
from app.db.session import get_db
from app.db.models import FunctionModel, FunctionVersionModel, UserModel

router = APIRouter()

# In-memory functions fallback cache
FUNCTIONS_DB = {}

@router.get("/", response_model=List[FunctionResponse])
async def list_functions(db: AsyncSession = Depends(get_db)):
    try:
        stmt = select(FunctionModel)
        res = await db.execute(stmt)
        db_funcs = res.scalars().all()
        if db_funcs:
            out = []
            for f in db_funcs:
                # Get latest version
                v_stmt = select(FunctionVersionModel).where(FunctionVersionModel.function_id == f.id).order_by(FunctionVersionModel.created_at.desc()).limit(1)
                v_res = await db.execute(v_stmt)
                v = v_res.scalars().first()

                latest_ver = None
                if v:
                    latest_ver = FunctionVersionResponse(
                        id=v.id,
                        function_name=v.function_name,
                        clerk_id=v.clerk_id,
                        version_number=v.version_number,
                        version_hash=v.version_hash,
                        runtime=v.runtime,
                        entry_point=v.entry_point,
                        memory_limit_mb=v.memory_limit_mb,
                        timeout_seconds=v.timeout_seconds,
                        image_tag=v.image_tag,
                        build_status=v.build_status,
                        created_at=v.created_at
                    )

                out.append(FunctionResponse(
                    id=f.id,
                    name=f.name,
                    clerk_id=f.clerk_id,
                    description=f.description,
                    created_at=f.created_at,
                    updated_at=f.updated_at,
                    latest_version=latest_ver,
                    total_invocations=f.total_invocations,
                    avg_duration_ms=f.avg_duration_ms
                ))
            return out
    except Exception as e:
        print(f"[Supabase DB Error] list_functions: {e}")

    return list(FUNCTIONS_DB.values())

@router.get("/{function_name}", response_model=FunctionResponse)
async def get_function(function_name: str, db: AsyncSession = Depends(get_db)):
    try:
        stmt = select(FunctionModel).where(FunctionModel.name == function_name)
        res = await db.execute(stmt)
        f = res.scalars().first()
        if f:
            v_stmt = select(FunctionVersionModel).where(FunctionVersionModel.function_id == f.id).order_by(FunctionVersionModel.created_at.desc()).limit(1)
            v_res = await db.execute(v_stmt)
            v = v_res.scalars().first()

            latest_ver = None
            if v:
                latest_ver = FunctionVersionResponse(
                    id=v.id,
                    function_name=v.function_name,
                    clerk_id=v.clerk_id,
                    version_number=v.version_number,
                    version_hash=v.version_hash,
                    runtime=v.runtime,
                    entry_point=v.entry_point,
                    memory_limit_mb=v.memory_limit_mb,
                    timeout_seconds=v.timeout_seconds,
                    image_tag=v.image_tag,
                    build_status=v.build_status,
                    created_at=v.created_at
                )

            return FunctionResponse(
                id=f.id,
                name=f.name,
                clerk_id=f.clerk_id,
                description=f.description,
                created_at=f.created_at,
                updated_at=f.updated_at,
                latest_version=latest_ver,
                total_invocations=f.total_invocations,
                avg_duration_ms=f.avg_duration_ms
            )
    except Exception as e:
        print(f"[Supabase DB Error] get_function: {e}")

    if function_name in FUNCTIONS_DB:
        return FUNCTIONS_DB[function_name]
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Function not found")

@router.post("/deploy", response_model=FunctionResponse)
async def deploy_function(payload: FunctionCreate, db: AsyncSession = Depends(get_db)):
    v_hash = compute_function_hash(
        code=payload.code,
        runtime=payload.runtime.value,
        entry_point=payload.entry_point,
        memory_mb=payload.memory_limit_mb,
        env_vars=payload.env_vars or {}
    )

    ver_id = f"v_{v_hash[:12]}"
    image_tag = f"podlaunch/{payload.name}:{ver_id}"

    try:
        # 1. Ensure User exists
        user_stmt = select(UserModel).where(UserModel.clerk_id == payload.clerk_id)
        user_res = await db.execute(user_stmt)
        user = user_res.scalars().first()
        if not user:
            user = UserModel(
                clerk_id=payload.clerk_id,
                email=f"{payload.clerk_id}@podlaunch.io",
                full_name="Developer"
            )
            db.add(user)
            await db.flush()

        # 2. Check if Function exists
        fn_stmt = select(FunctionModel).where(FunctionModel.clerk_id == payload.clerk_id, FunctionModel.name == payload.name)
        fn_res = await db.execute(fn_stmt)
        fn = fn_res.scalars().first()

        if not fn:
            fn = FunctionModel(
                clerk_id=payload.clerk_id,
                name=payload.name,
                description=payload.description or f"Serverless {payload.runtime.value} function",
                default_runtime=payload.runtime.value,
                default_entry_point=payload.entry_point,
                default_memory_mb=payload.memory_limit_mb,
                default_timeout_sec=payload.timeout_seconds
            )
            db.add(fn)
            await db.flush()

        # 3. Create Function Version
        ver = FunctionVersionModel(
            id=ver_id,
            function_id=fn.id,
            function_name=payload.name,
            clerk_id=payload.clerk_id,
            version_number="v1.0.0",
            version_hash=v_hash,
            runtime=payload.runtime.value,
            entry_point=payload.entry_point,
            code_payload=payload.code,
            memory_limit_mb=payload.memory_limit_mb,
            timeout_seconds=payload.timeout_seconds,
            image_tag=image_tag,
            build_status="Ready",
            env_vars=payload.env_vars or {}
        )
        db.add(ver)
        await db.commit()

        latest_ver = FunctionVersionResponse(
            id=ver.id,
            function_name=ver.function_name,
            clerk_id=ver.clerk_id,
            version_number=ver.version_number,
            version_hash=ver.version_hash,
            runtime=ver.runtime,
            entry_point=ver.entry_point,
            memory_limit_mb=ver.memory_limit_mb,
            timeout_seconds=ver.timeout_seconds,
            image_tag=ver.image_tag,
            build_status=ver.build_status,
            created_at=ver.created_at
        )

        return FunctionResponse(
            id=fn.id,
            name=fn.name,
            clerk_id=fn.clerk_id,
            description=fn.description,
            created_at=fn.created_at,
            updated_at=fn.updated_at,
            latest_version=latest_ver,
            total_invocations=fn.total_invocations,
            avg_duration_ms=fn.avg_duration_ms
        )

    except Exception as e:
        print(f"[Supabase DB Error] deploy_function: {e}")
        await db.rollback()

    # Fallback to in-memory
    version_obj = {
        "id": ver_id,
        "function_name": payload.name,
        "clerk_id": payload.clerk_id,
        "version_number": "v1.0.0",
        "version_hash": v_hash,
        "runtime": payload.runtime.value,
        "entry_point": payload.entry_point,
        "memory_limit_mb": payload.memory_limit_mb,
        "timeout_seconds": payload.timeout_seconds,
        "image_tag": image_tag,
        "build_status": "Ready",
        "created_at": datetime.utcnow()
    }

    fn_entry = {
        "name": payload.name,
        "clerk_id": payload.clerk_id,
        "description": payload.description or f"Serverless {payload.runtime.value} function",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "total_invocations": 0,
        "avg_duration_ms": 0.0,
        "latest_version": version_obj
    }

    FUNCTIONS_DB[payload.name] = fn_entry
    return fn_entry

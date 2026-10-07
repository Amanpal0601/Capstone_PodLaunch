from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, status
from app.contracts.schemas import FunctionCreate, FunctionResponse, FunctionVersionResponse
from app.services.registry.hasher import compute_function_hash

router = APIRouter()

# In-memory functions store with default seed functions
FUNCTIONS_DB = {
    "image-thumbnail-resizer": {
        "name": "image-thumbnail-resizer",
        "description": "Resizes incoming image stream and extracts metadata",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "invocations_count": 1420,
        "avg_duration_ms": 42.5,
        "latest_version": {
            "id": "v_a9f8b4c278e9",
            "function_name": "image-thumbnail-resizer",
            "version_hash": "a9f8b4c278e91024bcda73e91845bb02",
            "runtime": "python3.11",
            "entry_point": "handler.process_image",
            "memory_limit_mb": 128,
            "timeout_seconds": 5.0,
            "image_tag": "podlaunch/image-thumbnail-resizer:latest",
            "build_status": "Ready",
            "created_at": datetime.utcnow()
        }
    },
    "payment-webhook-validator": {
        "name": "payment-webhook-validator",
        "description": "Verifies HMAC signature on incoming merchant payment payloads",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "invocations_count": 3890,
        "avg_duration_ms": 18.2,
        "latest_version": {
            "id": "v_d41d8cd98f00",
            "function_name": "payment-webhook-validator",
            "version_hash": "d41d8cd98f00b204e9800998ecf8427e",
            "runtime": "node18",
            "entry_point": "index.validateWebhook",
            "memory_limit_mb": 256,
            "timeout_seconds": 3.0,
            "image_tag": "podlaunch/payment-webhook-validator:latest",
            "build_status": "Ready",
            "created_at": datetime.utcnow()
        }
    },
    "nlp-sentiment-analyzer": {
        "name": "nlp-sentiment-analyzer",
        "description": "Inference model evaluating sentence sentiment score",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "invocations_count": 840,
        "avg_duration_ms": 65.8,
        "latest_version": {
            "id": "v_7c4a8d09ca37",
            "function_name": "nlp-sentiment-analyzer",
            "version_hash": "7c4a8d09ca3762af61e59520943dc264",
            "runtime": "python3.11",
            "entry_point": "sentiment.analyze",
            "memory_limit_mb": 256,
            "timeout_seconds": 5.0,
            "image_tag": "podlaunch/nlp-sentiment-analyzer:latest",
            "build_status": "Ready",
            "created_at": datetime.utcnow()
        }
    }
}

@router.get("/", response_model=List[FunctionResponse])
async def list_functions():
    return list(FUNCTIONS_DB.values())

@router.get("/{function_name}", response_model=FunctionResponse)
async def get_function(function_name: str):
    if function_name not in FUNCTIONS_DB:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Function not found")
    return FUNCTIONS_DB[function_name]

@router.post("/deploy", response_model=FunctionResponse)
async def deploy_function(payload: FunctionCreate):
    v_hash = compute_function_hash(
        code=payload.code,
        runtime=payload.runtime.value,
        entry_point=payload.entry_point,
        memory_mb=payload.memory_limit_mb,
        env_vars=payload.env_vars or {}
    )

    version_obj = {
        "id": f"v_{v_hash[:12]}",
        "function_name": payload.name,
        "version_hash": v_hash,
        "runtime": payload.runtime.value,
        "entry_point": payload.entry_point,
        "memory_limit_mb": payload.memory_limit_mb,
        "timeout_seconds": payload.timeout_seconds,
        "image_tag": f"podlaunch/{payload.name}:latest",
        "build_status": "Ready",
        "created_at": datetime.utcnow()
    }

    fn_entry = {
        "name": payload.name,
        "description": payload.description or f"Serverless {payload.runtime.value} function",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "invocations_count": 0,
        "avg_duration_ms": 0.0,
        "latest_version": version_obj
    }

    FUNCTIONS_DB[payload.name] = fn_entry
    return fn_entry

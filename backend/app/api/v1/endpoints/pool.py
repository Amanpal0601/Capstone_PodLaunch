from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from app.contracts.schemas import StrategyEnum, ContainerInfo
from app.api.v1.endpoints.invoke import get_pool_manager, PoolManager

router = APIRouter()

@router.get("/containers", response_model=List[ContainerInfo])
async def list_active_containers(pool: PoolManager = Depends(get_pool_manager)):
    return pool.get_fleet()

@router.get("/strategy")
async def get_current_strategy(pool: PoolManager = Depends(get_pool_manager)):
    return {
        "active_strategy": pool.active_strategy.value,
        "available_strategies": [s.value for s in StrategyEnum]
    }

@router.post("/strategy/{strategy_name}")
async def switch_strategy(strategy_name: StrategyEnum, pool: PoolManager = Depends(get_pool_manager)):
    pool.set_strategy(strategy_name)
    return {
        "status": "SUCCESS",
        "active_strategy": pool.active_strategy.value,
        "message": f"Strategy switched to {strategy_name.value}"
    }

@router.post("/reap")
async def reap_stale_containers(pool: PoolManager = Depends(get_pool_manager)):
    if hasattr(pool.strategies[pool.active_strategy], "reap_stale"):
        await pool.strategies[pool.active_strategy].reap_stale()
    return {"status": "SUCCESS", "message": "Stale containers reaped."}

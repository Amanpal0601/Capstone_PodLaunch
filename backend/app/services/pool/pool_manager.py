import asyncio
from typing import Dict, List, Optional
from datetime import datetime
from app.contracts.schemas import StrategyEnum, ContainerInfo, ContainerStateEnum
from app.services.sandbox.docker_sandbox import DockerSandbox
from app.services.pool.strategies.base import PoolStrategy, ContainerAcquisition
from app.services.pool.strategies.naive import NaiveStrategy
from app.services.pool.strategies.keep_alive import KeepAliveStrategy
from app.services.pool.strategies.fixed_prewarm import FixedPreWarmStrategy
from app.services.pool.strategies.predictive import PredictivePreWarmStrategy

class PoolManager:
    def __init__(self, sandbox: DockerSandbox):
        self.sandbox = sandbox
        self.active_strategy: StrategyEnum = StrategyEnum.PREDICTIVE_PRE_WARM
        self.locks: Dict[str, asyncio.Lock] = {}
        
        # Strategies Registry
        self.strategies: Dict[StrategyEnum, PoolStrategy] = {
            StrategyEnum.NAIVE: NaiveStrategy(self.sandbox),
            StrategyEnum.KEEP_ALIVE: KeepAliveStrategy(self.sandbox, ttl_seconds=30.0),
            StrategyEnum.FIXED_PRE_WARM: FixedPreWarmStrategy(self.sandbox, target_idle_count=2),
            StrategyEnum.PREDICTIVE_PRE_WARM: PredictivePreWarmStrategy(self.sandbox, bucket_minutes=5)
        }
        
        # Tracked active containers inventory
        self.container_inventory: Dict[str, ContainerInfo] = {}

    def _get_lock(self, function_name: str) -> asyncio.Lock:
        if function_name not in self.locks:
            self.locks[function_name] = asyncio.Lock()
        return self.locks[function_name]

    def set_strategy(self, new_strategy: StrategyEnum) -> None:
        self.active_strategy = new_strategy

    async def acquire(self, function_name: str, metadata: dict) -> ContainerAcquisition:
        async with self._get_lock(function_name):
            strategy_impl = self.strategies[self.active_strategy]
            acq = await strategy_impl.acquire(function_name, metadata)
            
            # Record in inventory
            self.container_inventory[acq.container_id] = ContainerInfo(
                id=acq.container_id,
                function_name=function_name,
                version=metadata.get("version", "v1.0.0"),
                state=ContainerStateEnum.ACTIVE_RUNNING,
                memory_mb=acq.memory_mb,
                ttl_remaining_sec=30,
                invocations_served=1,
                created_at=datetime.utcnow()
            )
            return acq

    async def release(self, container_id: str, function_name: str, has_error: bool = False) -> None:
        async with self._get_lock(function_name):
            strategy_impl = self.strategies[self.active_strategy]
            await strategy_impl.release(container_id, function_name, has_error=has_error)
            
            if container_id in self.container_inventory:
                if has_error or self.active_strategy == StrategyEnum.NAIVE:
                    del self.container_inventory[container_id]
                else:
                    self.container_inventory[container_id].state = ContainerStateEnum.WARM_IDLE

    def get_fleet(self) -> List[ContainerInfo]:
        return list(self.container_inventory.values())

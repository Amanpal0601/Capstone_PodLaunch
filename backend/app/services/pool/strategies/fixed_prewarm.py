import asyncio
from typing import Dict, Any, List
from app.services.pool.strategies.base import PoolStrategy, ContainerAcquisition

class FixedPreWarmStrategy(PoolStrategy):
    """
    Fixed Pre-Warm Strategy:
    - Maintains a constant watermark of N warm idle containers per function.
    - Replenishes the pool asynchronously whenever count < target_idle_count.
    """
    def __init__(self, sandbox, target_idle_count: int = 2):
        self.sandbox = sandbox
        self.target_idle_count = target_idle_count
        self.idle_pools: Dict[str, List[str]] = {}

    async def acquire(self, function_name: str, metadata: Dict[str, Any]) -> ContainerAcquisition:
        pool = self.idle_pools.setdefault(function_name, [])
        mem = metadata.get("memory_limit_mb", 128)

        if pool:
            cid = pool.pop()
            # Asynchronous background replenishment
            asyncio.create_task(self._replenish(function_name, metadata))
            return ContainerAcquisition(container_id=cid, function_name=function_name, cold_start=False, memory_mb=mem)

        # Cold fallback
        cid = await self.sandbox.create(
            image_tag=metadata.get("image_tag", f"podlaunch/{function_name}:latest"),
            memory_limit_mb=mem
        )
        asyncio.create_task(self._replenish(function_name, metadata))
        return ContainerAcquisition(container_id=cid, function_name=function_name, cold_start=True, memory_mb=mem)

    async def _replenish(self, function_name: str, metadata: Dict[str, Any]) -> None:
        pool = self.idle_pools.setdefault(function_name, [])
        mem = metadata.get("memory_limit_mb", 128)
        while len(pool) < self.target_idle_count:
            cid = await self.sandbox.create(
                image_tag=metadata.get("image_tag", f"podlaunch/{function_name}:latest"),
                memory_limit_mb=mem
            )
            pool.append(cid)

    async def release(self, container_id: str, function_name: str, has_error: bool = False) -> None:
        pool = self.idle_pools.setdefault(function_name, [])
        if has_error or len(pool) >= self.target_idle_count:
            await self.sandbox.destroy(container_id)
        else:
            pool.append(container_id)

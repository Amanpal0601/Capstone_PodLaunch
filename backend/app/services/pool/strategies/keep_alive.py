import time
from typing import Dict, Any, List
from app.services.pool.strategies.base import PoolStrategy, ContainerAcquisition

class WarmContainer:
    def __init__(self, container_id: str, memory_mb: int = 128):
        self.container_id = container_id
        self.memory_mb = memory_mb
        self.last_used_at = time.time()
        self.invocations_served = 1

class KeepAliveStrategy(PoolStrategy):
    """
    Keep-Alive Strategy:
    - Retains warm containers in idle pool for TTL window.
    - Subsequent requests reuse the container (Warm Start).
    - Periodic reap_stale() cleans up containers exceeding TTL.
    """
    def __init__(self, sandbox, ttl_seconds: float = 30.0):
        self.sandbox = sandbox
        self.ttl_seconds = ttl_seconds
        self.idle_pools: Dict[str, List[WarmContainer]] = {}

    async def acquire(self, function_name: str, metadata: Dict[str, Any]) -> ContainerAcquisition:
        pool = self.idle_pools.setdefault(function_name, [])
        mem = metadata.get("memory_limit_mb", 128)
        
        if pool:
            warm_c = pool.pop()
            warm_c.invocations_served += 1
            return ContainerAcquisition(
                container_id=warm_c.container_id,
                function_name=function_name,
                cold_start=False,
                memory_mb=warm_c.memory_mb
            )

        # Cache Miss -> Cold Start
        cid = await self.sandbox.create(
            image_tag=metadata.get("image_tag", f"podlaunch/{function_name}:latest"),
            memory_limit_mb=mem
        )
        return ContainerAcquisition(container_id=cid, function_name=function_name, cold_start=True, memory_mb=mem)

    async def release(self, container_id: str, function_name: str, has_error: bool = False) -> None:
        if has_error:
            await self.sandbox.destroy(container_id)
            return
        
        pool = self.idle_pools.setdefault(function_name, [])
        pool.append(WarmContainer(container_id))

    async def reap_stale(self) -> None:
        now = time.time()
        for fn_name, pool in self.idle_pools.items():
            active_list = []
            for c in pool:
                if now - c.last_used_at > self.ttl_seconds:
                    await self.sandbox.destroy(c.container_id)
                else:
                    active_list.append(c)
            self.idle_pools[fn_name] = active_list

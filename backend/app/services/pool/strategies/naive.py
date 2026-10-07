from typing import Dict, Any
from app.services.pool.strategies.base import PoolStrategy, ContainerAcquisition

class NaiveStrategy(PoolStrategy):
    """
    Baseline Strategy:
    - acquire(): Spawns a new container (Cold Start).
    - release(): Immediately destroys the container.
    - Cold Start Rate: 100%
    """
    def __init__(self, sandbox):
        self.sandbox = sandbox

    async def acquire(self, function_name: str, metadata: Dict[str, Any]) -> ContainerAcquisition:
        mem = metadata.get("memory_limit_mb", 128)
        cid = await self.sandbox.create(
            image_tag=metadata.get("image_tag", f"podlaunch/{function_name}:latest"),
            memory_limit_mb=mem,
            cpu_quota=metadata.get("cpu_quota", 0.5)
        )
        return ContainerAcquisition(container_id=cid, function_name=function_name, cold_start=True, memory_mb=mem)

    async def release(self, container_id: str, function_name: str, has_error: bool = False) -> None:
        await self.sandbox.destroy(container_id)

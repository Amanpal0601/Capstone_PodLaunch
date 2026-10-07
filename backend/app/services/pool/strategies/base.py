from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class ContainerAcquisition:
    def __init__(self, container_id: str, function_name: str, cold_start: bool, memory_mb: int = 128):
        self.container_id = container_id
        self.function_name = function_name
        self.cold_start = cold_start
        self.memory_mb = memory_mb

class PoolStrategy(ABC):
    @abstractmethod
    async def acquire(self, function_name: str, metadata: Dict[str, Any]) -> ContainerAcquisition:
        pass

    @abstractmethod
    async def release(self, container_id: str, function_name: str, has_error: bool = False) -> None:
        pass

    async def reap_stale(self) -> None:
        """Optional hook for background TTL reaper."""
        pass

import asyncio
from typing import Dict
from app.contracts.schemas import ExecutionRequest

class SchedulerQueue:
    def __init__(self, default_concurrency_limit: int = 10):
        self.default_concurrency_limit = default_concurrency_limit
        self.semaphores: Dict[str, asyncio.Semaphore] = {}
        self.request_queue: asyncio.Queue = asyncio.Queue(maxsize=1000)

    def _get_semaphore(self, function_name: str) -> asyncio.Semaphore:
        if function_name not in self.semaphores:
            self.semaphores[function_name] = asyncio.Semaphore(self.default_concurrency_limit)
        return self.semaphores[function_name]

    async def schedule(self, request: ExecutionRequest):
        sem = self._get_semaphore(request.function_name)
        return sem

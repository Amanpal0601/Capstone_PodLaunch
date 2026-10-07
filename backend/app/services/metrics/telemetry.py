import asyncio
from datetime import datetime
from typing import List, Dict, Any
from app.contracts.schemas import MetricRecord

class TelemetryCollector:
    def __init__(self, max_buffer: int = 500):
        self.max_buffer = max_buffer
        self.logs_buffer: List[Dict[str, Any]] = []

    def record_invocation(self, record: Dict[str, Any]) -> None:
        self.logs_buffer.insert(0, record)
        if len(self.logs_buffer) > self.max_buffer:
            self.logs_buffer.pop()

    def get_recent_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self.logs_buffer[:limit]

    def get_summary_stats(self) -> Dict[str, Any]:
        if not self.logs_buffer:
            return {
                "total_invocations": 0,
                "cold_start_rate": 0.0,
                "p50_duration_ms": 0.0,
                "p99_duration_ms": 0.0
            }
        
        total = len(self.logs_buffer)
        cold_starts = sum(1 for log in self.logs_buffer if log.get("cold_start"))
        durations = sorted([log.get("duration_ms", 0.0) for log in self.logs_buffer])

        p50_idx = int(0.50 * total)
        p99_idx = min(int(0.99 * total), total - 1)

        return {
            "total_invocations": total,
            "cold_start_rate": round((cold_starts / total) * 100, 1),
            "p50_duration_ms": round(durations[p50_idx], 2),
            "p99_duration_ms": round(durations[p99_idx], 2)
        }

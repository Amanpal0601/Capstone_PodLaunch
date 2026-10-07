import hashlib
import json
from typing import Dict, Any

def compute_function_hash(code: str, runtime: str, entry_point: str, memory_mb: int, env_vars: Dict[str, Any]) -> str:
    """Computes deterministic SHA-256 hash across code and execution configuration."""
    hasher = hashlib.sha256()
    hasher.update(code.encode("utf-8"))
    hasher.update(runtime.encode("utf-8"))
    hasher.update(entry_point.encode("utf-8"))
    hasher.update(str(memory_mb).encode("utf-8"))
    hasher.update(json.dumps(env_vars, sort_keys=True).encode("utf-8"))
    return hasher.hexdigest()

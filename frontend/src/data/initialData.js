// Seed data and schemas for PodLaunch Neo-Brutalist Platform

export const TEAM_MEMBERS = [
  {
    name: "Aman Pal",
    role: "Function Registry & Invocation API",
    responsibilities: "Packaging pipeline, Dockerfile templating, metadata DB, FastAPI invocation entry point.",
    github: "amanpal",
    avatar: "AP",
    color: "var(--neo-yellow)"
  },
  {
    name: "Aryan Arora",
    role: "Scheduler & Queue",
    responsibilities: "Request queuing, concurrency limits, timeout handling, dispatching to Pool Manager.",
    github: "aryanarora",
    avatar: "AA",
    color: "var(--neo-mint)"
  },
  {
    name: "Tanishk Tiwari",
    role: "Container Pool Manager (Research Core)",
    responsibilities: "4 pooling strategies, acquire/release lifecycle, container TTL reaper, predictive pre-warming.",
    github: "tanishktiwari",
    avatar: "TT",
    color: "var(--neo-cyan)"
  },
  {
    name: "Harsh Aggarwal",
    role: "Execution Sandbox",
    responsibilities: "Docker execution boundary, CPU/memory limits, non-privileged isolation, error taxonomy.",
    github: "harshaggarwal",
    avatar: "HA",
    color: "var(--neo-purple)"
  },
  {
    name: "Rhythm Dhangar",
    role: "Metrics & Telemetry Systems",
    responsibilities: "Workload telemetry, async metric collection, streaming percentiles & UI architecture.",
    github: "rhythmdhangar",
    avatar: "RD",
    color: "var(--neo-pink)"
  }
];

export const STRATEGIES_INFO = {
  naive: {
    id: "naive",
    name: "Naive (Baseline)",
    tagline: "Always create fresh container, destroy immediately",
    description: "Every invocation triggers a cold start by spawning a new container on acquire() and immediately tearing it down on release(). Provides the baseline cold-start reference.",
    coldStartRate: "100%",
    p99Latency: "940ms",
    idleMemory: "0 MB",
    badgeColor: "tag-coral",
    accentColor: "var(--neo-coral)",
    cardBg: "#FFF1F2"
  },
  keep_alive: {
    id: "keep_alive",
    name: "Keep-Alive (TTL)",
    tagline: "Hold idle container for T seconds before reaping",
    description: "Containers remain warm in the pool for a configurable TTL window (default 30s). Re-invocations within the window achieve single-digit warm starts. Background reaper cleans stale containers.",
    coldStartRate: "42.8%",
    p99Latency: "480ms",
    idleMemory: "128 MB",
    badgeColor: "tag-yellow",
    accentColor: "var(--neo-yellow)",
    cardBg: "#FEFCE8"
  },
  fixed_pre_warm: {
    id: "fixed_pre_warm",
    name: "Fixed Pre-Warm (Watermark)",
    tagline: "Maintain constant N idle containers per function",
    description: "Background worker proactively keeps N warm idle containers per function. As soon as an idle container is consumed, asynchronous replenishment tops up the pool to watermark N.",
    coldStartRate: "18.5%",
    p99Latency: "195ms",
    idleMemory: "384 MB",
    badgeColor: "tag-purple",
    accentColor: "var(--neo-purple)",
    cardBg: "#FAF5FF"
  },
  predictive: {
    id: "predictive",
    name: "Predictive Pre-Warm (Research Core)",
    tagline: "Time-series moving average historical anticipation",
    description: "Analyzes historical invocation timestamps grouped in 5-minute sliding buckets. Proactively pre-warms containers right before predicted burst periods, balancing p99 latency with minimal idle memory.",
    coldStartRate: "4.2%",
    p99Latency: "28ms",
    idleMemory: "180 MB",
    badgeColor: "tag-cyan",
    accentColor: "var(--neo-cyan)",
    cardBg: "#F0FDF4",
    highlight: true
  }
};

export const INITIAL_FUNCTIONS = [
  {
    id: "fn-001",
    name: "image-thumbnail-resizer",
    version: "v1.2.0",
    versionHash: "a9f8b4c278e91024bcda73e91845bb02",
    runtime: "python3.11",
    entryPoint: "handler.process_image",
    memoryLimitMb: 128,
    timeoutSeconds: 5.0,
    status: "Ready",
    invocationsCount: 1420,
    avgDurationMs: 42.5,
    code: `import json
import time

def process_image(event, context):
    """Resizes incoming image stream and extracts EXIF metadata."""
    start_time = time.time()
    image_id = event.get("image_id", "default_img_01")
    target_dim = event.get("dimensions", [256, 256])
    
    # Process transformation simulation
    time.sleep(0.015) 
    
    return {
        "status": "PROCESSED",
        "image_id": image_id,
        "new_dimensions": target_dim,
        "processing_time_ms": round((time.time() - start_time) * 1000, 2)
    }`
  },
  {
    id: "fn-002",
    name: "payment-webhook-validator",
    version: "v2.0.1",
    versionHash: "d41d8cd98f00b204e9800998ecf8427e",
    runtime: "node18",
    entryPoint: "index.validateWebhook",
    memoryLimitMb: 256,
    timeoutSeconds: 3.0,
    status: "Ready",
    invocationsCount: 3890,
    avgDurationMs: 18.2,
    code: `exports.validateWebhook = async (event, context) => {
  const crypto = require('crypto');
  const signature = event.headers?.['x-signature'] || 'mock_sig';
  const payload = event.body || {};
  
  // Verify HMAC signature
  const hmac = crypto.createHmac('sha256', 'secret_key')
                     .update(JSON.stringify(payload))
                     .digest('hex');
                     
  return {
    verified: true,
    transaction_id: payload.txn_id || "TXN-99482",
    processed_at: new Date().toISOString()
  };
};`
  },
  {
    id: "fn-003",
    name: "nlp-sentiment-analyzer",
    version: "v1.0.4",
    versionHash: "7c4a8d09ca3762af61e59520943dc264",
    runtime: "python3.11",
    entryPoint: "sentiment.analyze",
    memoryLimitMb: 256,
    timeoutSeconds: 5.0,
    status: "Ready",
    invocationsCount: 840,
    avgDurationMs: 65.8,
    code: `def analyze(event, context):
    text = event.get("text", "PodLaunch makes serverless cold starts disappear!")
    
    positive_words = {"super", "fast", "great", "awesome", "disappear", "love", "optimized"}
    words = set(text.lower().split())
    score = len(words.intersection(positive_words)) / max(len(words), 1)
    
    return {
        "text": text,
        "sentiment": "POSITIVE" if score > 0.1 else "NEUTRAL",
        "confidence": min(score * 2.5, 0.98)
    }`
  }
];

export const INITIAL_CONTAINERS = [
  {
    id: "c-a9f81",
    functionName: "image-thumbnail-resizer",
    version: "v1.2.0",
    state: "WARM_IDLE",
    memoryMb: 128,
    createdAt: "2 mins ago",
    ttlRemainingSec: 24,
    invocationsServed: 14,
    ipAddress: "172.18.0.4"
  },
  {
    id: "c-a9f82",
    functionName: "image-thumbnail-resizer",
    version: "v1.2.0",
    state: "WARM_IDLE",
    memoryMb: 128,
    createdAt: "4 mins ago",
    ttlRemainingSec: 18,
    invocationsServed: 32,
    ipAddress: "172.18.0.5"
  },
  {
    id: "c-d41d1",
    functionName: "payment-webhook-validator",
    version: "v2.0.1",
    state: "ACTIVE_RUNNING",
    memoryMb: 256,
    createdAt: "30s ago",
    ttlRemainingSec: 30,
    invocationsServed: 8,
    ipAddress: "172.18.0.6"
  },
  {
    id: "c-d41d2",
    functionName: "payment-webhook-validator",
    version: "v2.0.1",
    state: "WARM_IDLE",
    memoryMb: 256,
    createdAt: "1 min ago",
    ttlRemainingSec: 28,
    invocationsServed: 45,
    ipAddress: "172.18.0.7"
  },
  {
    id: "c-7c4a1",
    functionName: "nlp-sentiment-analyzer",
    version: "v1.0.4",
    state: "WARM_IDLE",
    memoryMb: 256,
    createdAt: "3 mins ago",
    ttlRemainingSec: 12,
    invocationsServed: 9,
    ipAddress: "172.18.0.8"
  }
];

export const INITIAL_LOGS = [
  {
    requestId: "e4b2d184-78fa-4e89-9fa2-84920402a1e0",
    functionName: "payment-webhook-validator",
    version: "v2.0.1",
    strategy: "PREDICTIVE_PRE_WARM",
    coldStart: false,
    durationMs: 8.4,
    startupMs: 0.0,
    executionMs: 8.4,
    queueWaitMs: 0.8,
    status: "SUCCESS",
    errorType: "NONE",
    containerId: "c-d41d2",
    timestamp: "10 seconds ago"
  },
  {
    requestId: "198a44b1-e231-4190-b98a-44919012cd89",
    functionName: "image-thumbnail-resizer",
    version: "v1.2.0",
    strategy: "PREDICTIVE_PRE_WARM",
    coldStart: false,
    durationMs: 16.2,
    startupMs: 0.0,
    executionMs: 16.2,
    queueWaitMs: 1.1,
    status: "SUCCESS",
    errorType: "NONE",
    containerId: "c-a9f81",
    timestamp: "28 seconds ago"
  },
  {
    requestId: "921abcf0-4328-48aa-b91c-728109204481",
    functionName: "nlp-sentiment-analyzer",
    version: "v1.0.4",
    strategy: "PREDICTIVE_PRE_WARM",
    coldStart: true,
    durationMs: 412.0,
    startupMs: 385.0,
    executionMs: 27.0,
    queueWaitMs: 2.4,
    status: "SUCCESS",
    errorType: "NONE",
    containerId: "c-7c4a1",
    timestamp: "1 min ago"
  },
  {
    requestId: "f8204910-bcde-4201-a019-918230491204",
    functionName: "payment-webhook-validator",
    version: "v2.0.1",
    strategy: "PREDICTIVE_PRE_WARM",
    coldStart: false,
    durationMs: 6.9,
    startupMs: 0.0,
    executionMs: 6.9,
    queueWaitMs: 0.6,
    status: "SUCCESS",
    errorType: "NONE",
    containerId: "c-d41d1",
    timestamp: "2 mins ago"
  }
];

-- =============================================================================
-- PODLAUNCH SUPABASE DATABASE SCHEMA
-- Purpose: Relational Control Plane, Content-Hash Versioning & Time-Series Telemetry
-- Integration: Clerk Authentication (clerk_id) & Cold-Start Optimization Engine
-- =============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. USERS TABLE (Linked with Clerk Identity)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(128) UNIQUE NOT NULL, -- e.g. "user_2t1a8b9c..."
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(64) DEFAULT 'researcher', -- 'researcher', 'engineer', 'admin'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users (clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

-- =============================================================================
-- 2. FUNCTIONS TABLE (Serverless Functions Registry)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(128) NOT NULL REFERENCES public.users(clerk_id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    default_runtime VARCHAR(32) NOT NULL DEFAULT 'python3.11', -- 'python3.11' | 'node18'
    default_entry_point VARCHAR(128) NOT NULL DEFAULT 'handler.handler',
    default_memory_mb INTEGER NOT NULL DEFAULT 128 CHECK (default_memory_mb >= 64 AND default_memory_mb <= 1024),
    default_timeout_sec FLOAT NOT NULL DEFAULT 5.0 CHECK (default_timeout_sec >= 0.5 AND default_timeout_sec <= 30.0),
    concurrency_limit INTEGER NOT NULL DEFAULT 10,
    total_invocations BIGINT NOT NULL DEFAULT 0,
    avg_duration_ms FLOAT NOT NULL DEFAULT 0.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_function_name UNIQUE (clerk_id, name)
);

CREATE INDEX IF NOT EXISTS idx_functions_clerk_id ON public.functions (clerk_id);
CREATE INDEX IF NOT EXISTS idx_functions_name ON public.functions (name);

-- =============================================================================
-- 3. FUNCTION VERSIONS TABLE (Immutable Content-Hashed Artifacts)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.function_versions (
    id VARCHAR(64) PRIMARY KEY, -- e.g. "v_a9f8b4c278e9"
    function_id UUID NOT NULL REFERENCES public.functions(id) ON DELETE CASCADE,
    function_name VARCHAR(128) NOT NULL,
    clerk_id VARCHAR(128) NOT NULL REFERENCES public.users(clerk_id) ON DELETE CASCADE,
    version_number VARCHAR(32) NOT NULL DEFAULT 'v1.0.0',
    version_hash VARCHAR(64) NOT NULL, -- Deterministic SHA-256 (code + runtime + config)
    runtime VARCHAR(32) NOT NULL DEFAULT 'python3.11',
    entry_point VARCHAR(128) NOT NULL,
    code_payload TEXT NOT NULL,
    memory_limit_mb INTEGER NOT NULL DEFAULT 128,
    cpu_quota FLOAT NOT NULL DEFAULT 0.5,
    timeout_seconds FLOAT NOT NULL DEFAULT 5.0,
    image_tag VARCHAR(256) NOT NULL,
    build_status VARCHAR(32) NOT NULL DEFAULT 'Ready', -- 'Pending', 'Building', 'Ready', 'Failed'
    build_logs TEXT,
    env_vars JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_versions_fn_id ON public.function_versions (function_id);
CREATE INDEX IF NOT EXISTS idx_versions_clerk_id ON public.function_versions (clerk_id);
CREATE INDEX IF NOT EXISTS idx_versions_hash ON public.function_versions (version_hash);

-- =============================================================================
-- 4. INVOCATION LOGS TABLE (High-Throughput Telemetry & Cold-Start Research)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.invocation_logs (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    function_id UUID REFERENCES public.functions(id) ON DELETE CASCADE,
    function_name VARCHAR(128) NOT NULL,
    version_id VARCHAR(64) REFERENCES public.function_versions(id) ON DELETE SET NULL,
    clerk_id VARCHAR(128) NOT NULL REFERENCES public.users(clerk_id) ON DELETE CASCADE,
    strategy VARCHAR(32) NOT NULL, -- 'NAIVE', 'KEEP_ALIVE', 'FIXED_PRE_WARM', 'PREDICTIVE_PRE_WARM'
    cold_start BOOLEAN NOT NULL,
    startup_ms FLOAT NOT NULL DEFAULT 0.0,
    execution_ms FLOAT NOT NULL DEFAULT 0.0,
    total_time_ms FLOAT NOT NULL DEFAULT 0.0,
    queue_wait_time_ms FLOAT NOT NULL DEFAULT 0.0,
    idle_memory_mb FLOAT NOT NULL DEFAULT 0.0,
    container_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS' | 'ERROR'
    error_type VARCHAR(32) NOT NULL DEFAULT 'NONE', -- 'NONE', 'FUNCTION_ERROR', 'TIMEOUT', 'MEMORY_LIMIT', 'SANDBOX_ERROR'
    error_message TEXT,
    -- 5-minute bucket index (0 to 287) for sub-millisecond Predictive Pre-warming queries
    time_bucket_5m INTEGER GENERATED ALWAYS AS (
        (EXTRACT(HOUR FROM timestamp AT TIME ZONE 'UTC')::INTEGER * 60 + 
         EXTRACT(MINUTE FROM timestamp AT TIME ZONE 'UTC')::INTEGER) / 5
    ) STORED,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Essential Performance & Research Indexes
CREATE INDEX IF NOT EXISTS idx_invocations_fn_timestamp ON public.invocation_logs (function_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_invocations_clerk_timestamp ON public.invocation_logs (clerk_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_invocations_predictive ON public.invocation_logs (function_name, time_bucket_5m, cold_start);
CREATE INDEX IF NOT EXISTS idx_invocations_strategy_cold ON public.invocation_logs (strategy, cold_start);

-- =============================================================================
-- 5. AUTOMATIC TIMESTAMP TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_users_updated_at ON public.users;
CREATE TRIGGER trg_update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_functions_updated_at ON public.functions;
CREATE TRIGGER trg_update_functions_updated_at
    BEFORE UPDATE ON public.functions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.function_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invocation_logs ENABLE ROW LEVEL SECURITY;

-- Allow service_role (Backend API) full read/write access
DROP POLICY IF EXISTS "Service role full access on users" ON public.users;
CREATE POLICY "Service role full access on users" ON public.users
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Service role full access on functions" ON public.functions;
CREATE POLICY "Service role full access on functions" ON public.functions
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Service role full access on versions" ON public.function_versions;
CREATE POLICY "Service role full access on versions" ON public.function_versions
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Service role full access on invocations" ON public.invocation_logs;
CREATE POLICY "Service role full access on invocations" ON public.invocation_logs
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');

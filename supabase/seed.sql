-- =============================================================================
-- PODLAUNCH SUPABASE SEED DATA
-- Default Group-22 Researchers & Initial Benchmark Functions
-- =============================================================================

-- 1. Seed Lead User (Aman Pal)
INSERT INTO public.users (clerk_id, email, full_name, role, avatar_url)
VALUES (
    'user_group22_lead_amanpal',
    'amanpal@podlaunch.local',
    'Aman Pal',
    'Function Registry & API Lead (Group-22)',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Aman'
) ON CONFLICT (clerk_id) DO NOTHING;

-- 2. Seed Functions for the Lead User
INSERT INTO public.functions (id, clerk_id, name, description, default_runtime, default_entry_point, default_memory_mb, default_timeout_sec, total_invocations, avg_duration_ms)
VALUES
    ('f1111111-1111-1111-1111-111111111111', 'user_group22_lead_amanpal', 'image-thumbnail-resizer', 'Resizes incoming image stream and extracts EXIF metadata', 'python3.11', 'handler.process_image', 128, 5.0, 1420, 42.5),
    ('f2222222-2222-2222-2222-222222222222', 'user_group22_lead_amanpal', 'payment-webhook-validator', 'Verifies HMAC signature on merchant payloads', 'node18', 'index.validateWebhook', 256, 3.0, 3890, 18.2),
    ('f3333333-3333-3333-3333-333333333333', 'user_group22_lead_amanpal', 'nlp-sentiment-analyzer', 'Calculates sentiment score on incoming text sentences', 'python3.11', 'sentiment.analyze', 256, 5.0, 840, 65.8)
ON CONFLICT (clerk_id, name) DO NOTHING;

-- 3. Seed Function Versions
INSERT INTO public.function_versions (id, function_id, function_name, clerk_id, version_number, version_hash, runtime, entry_point, code_payload, memory_limit_mb, timeout_seconds, image_tag, build_status)
VALUES
    ('v_a9f8b4c278e9', 'f1111111-1111-1111-1111-111111111111', 'image-thumbnail-resizer', 'user_group22_lead_amanpal', 'v1.2.0', 'a9f8b4c278e91024bcda73e91845bb02', 'python3.11', 'handler.process_image', 'def process_image(event, context):\n    return {"status": "PROCESSED"}', 128, 5.0, 'podlaunch/image-thumbnail-resizer:v1.2.0', 'Ready'),
    ('v_d41d8cd98f00', 'f2222222-2222-2222-2222-222222222222', 'payment-webhook-validator', 'user_group22_lead_amanpal', 'v2.0.1', 'd41d8cd98f00b204e9800998ecf8427e', 'node18', 'index.validateWebhook', 'exports.validateWebhook = async (e, c) => ({ verified: true });', 256, 3.0, 'podlaunch/payment-webhook-validator:v2.0.1', 'Ready'),
    ('v_7c4a8d09ca37', 'f3333333-3333-3333-3333-333333333333', 'nlp-sentiment-analyzer', 'user_group22_lead_amanpal', 'v1.0.4', '7c4a8d09ca3762af61e59520943dc264', 'python3.11', 'sentiment.analyze', 'def analyze(event, context):\n    return {"sentiment": "POSITIVE"}', 256, 5.0, 'podlaunch/nlp-sentiment-analyzer:v1.0.4', 'Ready')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Telemetry Invocations (Mixture of Warm and Cold Starts)
INSERT INTO public.invocation_logs (request_id, function_id, function_name, version_id, clerk_id, strategy, cold_start, startup_ms, execution_ms, total_time_ms, queue_wait_time_ms, idle_memory_mb, container_id, status)
VALUES
    ('e4b2d184-78fa-4e89-9fa2-84920402a1e0', 'f2222222-2222-2222-2222-222222222222', 'payment-webhook-validator', 'v_d41d8cd98f00', 'user_group22_lead_amanpal', 'PREDICTIVE_PRE_WARM', false, 0.0, 8.4, 8.4, 0.8, 256.0, 'c-d41d2', 'SUCCESS'),
    ('198a44b1-e231-4190-b98a-44919012cd89', 'f1111111-1111-1111-1111-111111111111', 'image-thumbnail-resizer', 'v_a9f8b4c278e9', 'user_group22_lead_amanpal', 'PREDICTIVE_PRE_WARM', false, 0.0, 16.2, 16.2, 1.1, 128.0, 'c-a9f81', 'SUCCESS'),
    ('921abcf0-4328-48aa-b91c-728109204481', 'f3333333-3333-3333-3333-333333333333', 'nlp-sentiment-analyzer', 'v_7c4a8d09ca37', 'user_group22_lead_amanpal', 'PREDICTIVE_PRE_WARM', true, 385.0, 27.0, 412.0, 2.4, 256.0, 'c-7c4a1', 'SUCCESS')
ON CONFLICT (request_id) DO NOTHING;

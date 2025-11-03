-- Fix Supabase Realtime DELETE events
-- This ensures DELETE events include the full record data in payload.old
-- Without this, DELETE events may not propagate correctly to subscribers

-- Set REPLICA IDENTITY FULL for all tables that need realtime DELETE events
ALTER TABLE boss_timers REPLICA IDENTITY FULL;
ALTER TABLE room_members REPLICA IDENTITY FULL;
ALTER TABLE rooms REPLICA IDENTITY FULL;

-- Verify the configuration
SELECT
  nspname as schema_name,
  relname as table_name,
  CASE relreplident
    WHEN 'd' THEN 'default'
    WHEN 'n' THEN 'nothing'
    WHEN 'f' THEN 'full'
    WHEN 'i' THEN 'index'
  END as replica_identity
FROM pg_class
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE nspname = 'public'
  AND relname IN ('boss_timers', 'room_members', 'rooms');

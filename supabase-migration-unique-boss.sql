-- Migration: Add unique constraint to boss_timers
-- This ensures only one timer per boss per room

-- Add unique constraint
ALTER TABLE boss_timers
ADD CONSTRAINT boss_timers_room_boss_unique UNIQUE (room_id, boss_id);

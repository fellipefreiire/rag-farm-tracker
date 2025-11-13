-- Migration: Update boss_timers to use only alert_180_played
-- This migration removes the old alert fields (alert_90_played, alert_120_played)
-- and adds a single alert_180_played field that triggers when the timer reaches 00:00

-- Remove old alert columns
ALTER TABLE boss_timers DROP COLUMN IF EXISTS alert_90_played;
ALTER TABLE boss_timers DROP COLUMN IF EXISTS alert_120_played;

-- Add new alert_180_played column
ALTER TABLE boss_timers ADD COLUMN IF NOT EXISTS alert_180_played BOOLEAN DEFAULT false;

-- Update existing records to set alert_180_played to false
UPDATE boss_timers SET alert_180_played = false WHERE alert_180_played IS NULL;

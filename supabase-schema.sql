-- Schema for Boss Time Tracker Shared Rooms
-- Run this SQL in your Supabase SQL Editor

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  creator_id TEXT
);

-- Create room_members table
CREATE TABLE IF NOT EXISTS room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL,
  user_color TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create boss_timers table
CREATE TABLE IF NOT EXISTS boss_timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  boss_id INTEGER NOT NULL,
  boss_name TEXT NOT NULL,
  kill_time BIGINT NOT NULL,
  kill_time_utc TEXT NOT NULL,
  kill_time_local TEXT NOT NULL,
  respawn_minutes INTEGER NOT NULL,
  next_spawn_time BIGINT NOT NULL,
  player_name TEXT,
  added_by_member_id UUID REFERENCES room_members(id) ON DELETE CASCADE NOT NULL,
  added_by_display_name TEXT NOT NULL,
  added_by_color TEXT NOT NULL,
  alert_90_played BOOLEAN DEFAULT false,
  alert_120_played BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Ensure only one timer per boss per room
  UNIQUE(room_id, boss_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_boss_timers_room_id ON boss_timers(room_id);
CREATE INDEX IF NOT EXISTS idx_rooms_last_activity ON rooms(last_activity);

-- Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE boss_timers ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations (since we're using password protection)
-- For production, you might want more restrictive policies

-- Rooms policies
CREATE POLICY "Allow all operations on rooms" ON rooms
  FOR ALL USING (true) WITH CHECK (true);

-- Room members policies
CREATE POLICY "Allow all operations on room_members" ON room_members
  FOR ALL USING (true) WITH CHECK (true);

-- Boss timers policies
CREATE POLICY "Allow all operations on boss_timers" ON boss_timers
  FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE boss_timers;

-- Function to clean up inactive rooms (optional, can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_inactive_rooms()
RETURNS void AS $$
BEGIN
  -- Delete rooms where all members have been inactive for more than 5 minutes
  DELETE FROM rooms
  WHERE id IN (
    SELECT r.id
    FROM rooms r
    LEFT JOIN room_members rm ON r.id = rm.room_id
    WHERE rm.id IS NULL
       OR NOT EXISTS (
         SELECT 1
         FROM room_members rm2
         WHERE rm2.room_id = r.id
           AND rm2.last_seen > now() - INTERVAL '5 minutes'
       )
  );
END;
$$ LANGUAGE plpgsql;

-- You can set up a cron job or Edge Function to call cleanup_inactive_rooms() periodically

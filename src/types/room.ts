// Room-related types for shared Boss Time Tracker

export interface Room {
  id: string;
  name: string;
  password_hash: string;
  created_at: string;
  last_activity: string;
  creator_id?: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  display_name: string;
  user_color: string;
  joined_at: string;
  last_seen: string;
}

export interface SharedBossTimer {
  id: string;
  room_id: string;
  boss_id: number;
  boss_name: string;
  kill_time: number; // timestamp in milliseconds
  kill_time_utc: string;
  kill_time_local: string;
  respawn_minutes: number;
  next_spawn_time: number;
  player_name?: string;
  added_by_member_id: string;
  added_by_display_name: string;
  added_by_color: string;
  alert_90_played: boolean;
  alert_120_played: boolean;
  created_at: string;
}

// Local state for room
export interface RoomState {
  room: Room | null;
  member: RoomMember | null;
  members: RoomMember[];
  timers: SharedBossTimer[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

// Actions for creating/joining rooms
export interface CreateRoomData {
  roomName: string;
  password: string;
  displayName: string;
}

export interface JoinRoomData {
  roomId: string;
  password: string;
  displayName: string;
}

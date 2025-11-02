export interface Drop {
  itemId: number;
  name: string;
  eName: string;
  rate: number;
  slots: number;
  type: number;
}

export interface Mob {
  id: number;
  name: string;
  jName: string;
  sprite: string;
  level: number;
  hp: number;
  baseExp: number;
  jobExp: number;
  race: string;
  size: string;
  element: string;
  elementLevel: number;
  drops: Drop[];
}

export interface MobIndex {
  id: number;
  name: string;
  jName: string;
  level: number;
  element: string;
  race: string;
}

export interface Item {
  id: number;
  name: string;
  eName: string;
  type: number;
  subtype: number;
  weight: number;
  valueBuy: number;
  valueSell: number;
  slots: number;
}

export interface DroppedItem {
  itemId: number;
  itemName: string;
  itemEName: string;
  quantity: number;
  npcValue: number;
  customValue?: number;
}

export interface SessionMob {
  mobId: number;
  mobName: string;
  drops: DroppedItem[];
}

export type SessionStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface Session {
  id: string;
  name: string;
  status: SessionStatus;
  startTime: number;
  endTime?: number;
  totalTime: number; // in milliseconds
  pausedTime: number; // accumulated paused time
  lastPauseStart?: number;
  selectedMobs: SessionMob[];
  totalProfit: number;
  profitPerHour: number;
}

export interface SessionHistory {
  sessions: Session[];
}

// Boss Time Tracker Types
export interface Boss extends Mob {
  isMVP: boolean;
  isMini: boolean;
  respawnTime: number; // in minutes
  mapLocation?: string;
}

export type TimerStatus = 'active' | 'warning' | 'respawned';

export interface BossTimerEntry {
  id: string;
  bossId: number;
  bossName: string;
  killTime: number; // timestamp in milliseconds
  killTimeUTC: string; // formatted UTC time (HH:MM)
  killTimeLocal: string; // formatted local time (HH:MM)
  respawnMinutes: number; // respawn time in minutes (default 180)
  nextSpawnTime: number; // calculated timestamp for 120 minutes
  playerName?: string;
  alert90Played: boolean; // tracks if 90min alert has been played
  alert120Played: boolean; // tracks if 120min alert has been played
  createdAt: number; // timestamp when entry was created
}

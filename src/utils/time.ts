export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function msToHours(ms: number): number {
  return ms / (1000 * 60 * 60);
}

// Boss Time Tracker utilities
export function getTimeRemaining(killTime: number): number {
  // Always count to 180 minutes (maximum respawn time)
  const maxRespawnMs = 180 * 60 * 1000;
  const nextSpawn = killTime + maxRespawnMs;
  const now = Date.now();
  return Math.max(0, nextSpawn - now);
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function hasRespawned(killTime: number): boolean {
  // Boss has respawned after 180 minutes
  const maxRespawnMs = 180 * 60 * 1000;
  return Date.now() >= (killTime + maxRespawnMs);
}

export function shouldAlert180(killTime: number, alert180Played: boolean): boolean {
  // Alert at 180 minutes (when boss respawns - timer reaches 00:00)
  const alert180Ms = 180 * 60 * 1000;
  const timeSinceKill = Date.now() - killTime;
  return !alert180Played && timeSinceKill >= alert180Ms;
}

export function getTimeSinceKill(killTime: number): number {
  return Date.now() - killTime;
}

export function formatTimeHHMM(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getUTCTimeString(date: Date): string {
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getLocalTimeString(date: Date): string {
  return formatTimeHHMM(date);
}

export function parseTimeInput(timeInput: string, baseDate: Date = new Date()): number {
  const [hours, minutes] = timeInput.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error('Invalid time format');
  }

  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
}

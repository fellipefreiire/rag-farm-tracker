import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { SharedBossTimer, RoomMember } from '../types/room';
import type { Boss } from '../types/index';
import { playAlertSound } from '../utils/audio';
import { shouldAlert90, shouldAlert120 } from '../utils/time';

interface UseRealtimeTimersProps {
  roomId: string | null;
  member: RoomMember | null;
}

export function useRealtimeTimers({ roomId, member }: UseRealtimeTimersProps) {
  const [timers, setTimers] = useState<SharedBossTimer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial timers
  useEffect(() => {
    if (!supabase || !roomId) return;

    const fetchTimers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase!
          .from('boss_timers')
          .select()
          .eq('room_id', roomId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setTimers(data || []);
      } catch (err: any) {
        console.error('Fetch timers error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimers();
  }, [roomId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!supabase || !roomId) return;

    const channel = supabase
      .channel(`boss_timers:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'boss_timers',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setTimers(prev => [payload.new as SharedBossTimer, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'boss_timers',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setTimers(prev =>
            prev.map(t => (t.id === payload.new.id ? (payload.new as SharedBossTimer) : t))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'boss_timers',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setTimers(prev => prev.filter(t => t.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [roomId]);

  // Check for alerts
  useEffect(() => {
    if (!supabase || !roomId) return;

    const checkAlerts = async () => {
      for (const timer of timers) {
        let updated = false;
        const updates: Partial<SharedBossTimer> = {};

        // Check 90 minute alert
        if (shouldAlert90(timer.kill_time, timer.alert_90_played)) {
          playAlertSound();
          updates.alert_90_played = true;
          updated = true;
        }

        // Check 120 minute alert
        if (shouldAlert120(timer.kill_time, timer.alert_120_played)) {
          playAlertSound();
          updates.alert_120_played = true;
          updated = true;
        }

        // Update in database
        if (updated) {
          await supabase!
            .from('boss_timers')
            .update(updates)
            .eq('id', timer.id);
        }
      }
    };

    const interval = setInterval(checkAlerts, 1000); // Check every second

    return () => clearInterval(interval);
  }, [timers, roomId]);

  // Add new timer
  const addTimer = useCallback(
    async (boss: Boss, killTimeInput: string, playerName?: string) => {
      if (!supabase || !roomId || !member) {
        setError('Sala não conectada');
        return false;
      }

      try {
        // Parse server time (UTC)
        const [hours, minutes] = killTimeInput.split(':').map(Number);
        const now = new Date();
        const killDate = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            hours,
            minutes,
            0,
            0
          )
        );

        // If the kill time is in the future, assume it was yesterday
        if (killDate.getTime() > now.getTime()) {
          killDate.setUTCDate(killDate.getUTCDate() - 1);
        }

        const killTime = killDate.getTime();

        // Get user timezone offset
        const userTimezoneOffset = new Date().getTimezoneOffset() / -60;

        // Format times with timezone
        const formatTimeWithZone = (date: Date, isUTC: boolean = false): string => {
          const h = isUTC ? date.getUTCHours() : date.getHours();
          const m = isUTC ? date.getUTCMinutes() : date.getMinutes();
          const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

          if (isUTC) {
            return `${timeStr} (UTC)`;
          } else {
            const offset = userTimezoneOffset;
            const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
            return `${timeStr} (UTC${offsetStr})`;
          }
        };

        const newTimer = {
          room_id: roomId,
          boss_id: boss.id,
          boss_name: boss.name,
          kill_time: killTime,
          kill_time_utc: formatTimeWithZone(new Date(killTime), true),
          kill_time_local: formatTimeWithZone(new Date(killTime), false),
          respawn_minutes: boss.respawnTime,
          next_spawn_time: killTime + 120 * 60 * 1000, // Always 120 minutes
          player_name: playerName?.trim() || null,
          added_by_member_id: member.id,
          added_by_display_name: member.display_name,
          added_by_color: member.user_color,
          alert_90_played: false,
          alert_120_played: false,
        };

        // Check if timer already exists for this boss
        const existingTimer = await supabase
          .from('boss_timers')
          .select('id')
          .eq('room_id', roomId)
          .eq('boss_id', boss.id)
          .maybeSingle();

        let error;

        if (existingTimer.data) {
          // Update existing timer
          const result = await supabase
            .from('boss_timers')
            .update(newTimer)
            .eq('id', existingTimer.data.id);
          error = result.error;
        } else {
          // Insert new timer
          const result = await supabase
            .from('boss_timers')
            .insert(newTimer);
          error = result.error;
        }

        if (error) throw error;

        return true;
      } catch (err: any) {
        console.error('Add timer error:', err);
        setError(err.message);
        return false;
      }
    },
    [supabase, roomId, member]
  );

  // Remove timer
  const removeTimer = useCallback(
    async (timerId: string) => {
      if (!supabase) return false;

      try {
        const { error } = await supabase.from('boss_timers').delete().eq('id', timerId);

        if (error) throw error;

        return true;
      } catch (err: any) {
        console.error('Remove timer error:', err);
        setError(err.message);
        return false;
      }
    },
    [supabase]
  );

  return {
    timers,
    isLoading,
    error,
    addTimer,
    removeTimer,
  };
}

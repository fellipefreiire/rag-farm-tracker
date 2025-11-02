import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Room, RoomMember, RoomState, CreateRoomData, JoinRoomData } from '../types/room';
import { hashPassword, validateRoomName, validatePassword, validateDisplayName } from '../utils/room';
import { getRandomUserColor } from '../utils/colors';

const ROOM_STORAGE_KEY = 'currentRoom';
const MEMBER_STORAGE_KEY = 'currentMember';

interface StoredRoomData {
  roomId: string;
  memberId: string;
  displayName: string;
  userColor: string;
}

export function useRoom() {
  const [state, setState] = useState<RoomState>({
    room: null,
    member: null,
    members: [],
    timers: [],
    isConnected: false,
    isLoading: false,
    error: null,
  });

  const [heartbeatInterval, setHeartbeatInterval] = useState<NodeJS.Timeout | null>(null);

  // Heartbeat to update last_seen
  const startHeartbeat = useCallback((memberId: string) => {
    const interval = setInterval(async () => {
      if (!supabase) return;

      try {
        await supabase
          .from('room_members')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', memberId);
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    }, 30000); // Every 30 seconds

    setHeartbeatInterval(interval);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      setHeartbeatInterval(null);
    }
  }, [heartbeatInterval]);

  // Save room data to localStorage
  const saveRoomToStorage = useCallback((room: Room, member: RoomMember) => {
    const data: StoredRoomData = {
      roomId: room.id,
      memberId: member.id,
      displayName: member.display_name,
      userColor: member.user_color,
    };
    localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(data));
  }, []);

  // Clear room data from localStorage
  const clearRoomFromStorage = useCallback(() => {
    localStorage.removeItem(ROOM_STORAGE_KEY);
  }, []);

  // Load room data from localStorage and reconnect
  const reconnectToStoredRoom = useCallback(async () => {
    if (!supabase) return false;

    const stored = localStorage.getItem(ROOM_STORAGE_KEY);
    if (!stored) return false;

    try {
      const data: StoredRoomData = JSON.parse(stored);

      setState(prev => ({ ...prev, isLoading: true }));

      // Get room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select()
        .eq('id', data.roomId)
        .single();

      if (roomError) {
        clearRoomFromStorage();
        return false;
      }

      // Check if member still exists
      const { data: member, error: memberError } = await supabase
        .from('room_members')
        .select()
        .eq('id', data.memberId)
        .single();

      if (memberError) {
        // Member was deleted, recreate
        const { data: newMember, error: createError } = await supabase
          .from('room_members')
          .insert({
            room_id: room.id,
            display_name: data.displayName,
            user_color: data.userColor,
          })
          .select()
          .single();

        if (createError) {
          clearRoomFromStorage();
          return false;
        }

        // Update stored member ID
        saveRoomToStorage(room, newMember);

        // Get all members
        const { data: members } = await supabase
          .from('room_members')
          .select()
          .eq('room_id', room.id);

        setState(prev => ({
          ...prev,
          room,
          member: newMember,
          members: members || [],
          isConnected: true,
          isLoading: false,
        }));

        startHeartbeat(newMember.id);
        return true;
      }

      // Member exists, just reconnect
      const { data: members } = await supabase
        .from('room_members')
        .select()
        .eq('room_id', room.id);

      setState(prev => ({
        ...prev,
        room,
        member,
        members: members || [],
        isConnected: true,
        isLoading: false,
      }));

      startHeartbeat(member.id);
      return true;
    } catch (error) {
      console.error('Reconnect error:', error);
      clearRoomFromStorage();
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [supabase, startHeartbeat, saveRoomToStorage, clearRoomFromStorage]);

  // Auto-reconnect on mount
  useEffect(() => {
    reconnectToStoredRoom();
  }, [reconnectToStoredRoom]);

  // Create a new room
  const createRoom = useCallback(async (data: CreateRoomData) => {
    if (!supabase) {
      setState(prev => ({ ...prev, error: 'Supabase não configurado' }));
      return { success: false, roomId: null };
    }

    // Validate inputs
    const nameError = validateRoomName(data.roomName);
    const passwordError = validatePassword(data.password);
    const displayNameError = validateDisplayName(data.displayName);

    if (nameError || passwordError || displayNameError) {
      setState(prev => ({ ...prev, error: nameError || passwordError || displayNameError }));
      return { success: false, roomId: null };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Hash password
      const passwordHash = await hashPassword(data.password);

      // Create room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          name: data.roomName.trim(),
          password_hash: passwordHash,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Create member
      const userColor = getRandomUserColor();
      const { data: member, error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          display_name: data.displayName.trim(),
          user_color: userColor,
        })
        .select()
        .single();

      if (memberError) throw memberError;

      setState(prev => ({
        ...prev,
        room,
        member,
        members: [member],
        isConnected: true,
        isLoading: false,
      }));

      saveRoomToStorage(room, member);
      startHeartbeat(member.id);

      return { success: true, roomId: room.id };
    } catch (error: any) {
      console.error('Create room error:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao criar sala',
        isLoading: false,
      }));
      return { success: false, roomId: null };
    }
  }, [startHeartbeat]);

  // Join existing room
  const joinRoom = useCallback(async (data: JoinRoomData) => {
    if (!supabase) {
      setState(prev => ({ ...prev, error: 'Supabase não configurado' }));
      return { success: false };
    }

    // Validate inputs
    const passwordError = validatePassword(data.password);
    const displayNameError = validateDisplayName(data.displayName);

    if (passwordError || displayNameError) {
      setState(prev => ({ ...prev, error: passwordError || displayNameError }));
      return { success: false };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select()
        .eq('id', data.roomId)
        .single();

      if (roomError) throw new Error('Sala não encontrada');

      // Verify password
      const passwordHash = await hashPassword(data.password);
      if (room.password_hash !== passwordHash) {
        throw new Error('Senha incorreta');
      }

      // Create member
      const userColor = getRandomUserColor();
      const { data: member, error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          display_name: data.displayName.trim(),
          user_color: userColor,
        })
        .select()
        .single();

      if (memberError) throw memberError;

      // Get all members
      const { data: members, error: membersError } = await supabase
        .from('room_members')
        .select()
        .eq('room_id', room.id);

      if (membersError) throw membersError;

      setState(prev => ({
        ...prev,
        room,
        member,
        members: members || [],
        isConnected: true,
        isLoading: false,
      }));

      saveRoomToStorage(room, member);
      startHeartbeat(member.id);

      return { success: true };
    } catch (error: any) {
      console.error('Join room error:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao entrar na sala',
        isLoading: false,
      }));
      return { success: false };
    }
  }, [startHeartbeat]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!supabase || !state.member) return;

    stopHeartbeat();
    clearRoomFromStorage();

    try {
      // Delete member (cascade will handle cleanup)
      await supabase
        .from('room_members')
        .delete()
        .eq('id', state.member.id);

      setState({
        room: null,
        member: null,
        members: [],
        timers: [],
        isConnected: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Leave room error:', error);
    }
  }, [state.member, stopHeartbeat, clearRoomFromStorage]);

  // Subscribe to room members updates
  useEffect(() => {
    if (!supabase || !state.room) return;

    const channel = supabase
      .channel(`room_members:${state.room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_members',
          filter: `room_id=eq.${state.room.id}`,
        },
        async () => {
          // Refetch members
          const { data: members } = await supabase
            .from('room_members')
            .select()
            .eq('room_id', state.room.id);

          if (members) {
            setState(prev => ({ ...prev, members }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.room]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHeartbeat();
    };
  }, [stopHeartbeat]);

  return {
    ...state,
    createRoom,
    joinRoom,
    leaveRoom,
  };
}

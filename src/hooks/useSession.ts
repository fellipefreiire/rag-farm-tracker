import { useState, useCallback, useEffect } from 'react';
import type { Session, SessionMob, Mob } from '../types';

const STORAGE_KEY = 'rag-farm-sessions';
const CURRENT_SESSION_KEY = 'rag-farm-current-session';

export function useSession(mobsData: Record<string, Mob>) {
  const [currentSession, setCurrentSession] = useState<Session>(() => {
    const saved = localStorage.getItem(CURRENT_SESSION_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return createNewSession();
  });

  useEffect(() => {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(currentSession));
  }, [currentSession]);

  const startSession = useCallback(() => {
    setCurrentSession(prev => ({
      ...prev,
      status: 'running',
      startTime: Date.now(),
      lastPauseStart: undefined
    }));
  }, []);

  const pauseSession = useCallback(() => {
    setCurrentSession(prev => ({
      ...prev,
      status: 'paused',
      lastPauseStart: Date.now()
    }));
  }, []);

  const resumeSession = useCallback(() => {
    setCurrentSession(prev => {
      const pauseDuration = prev.lastPauseStart ? Date.now() - prev.lastPauseStart : 0;
      return {
        ...prev,
        status: 'running',
        pausedTime: prev.pausedTime + pauseDuration,
        lastPauseStart: undefined
      };
    });
  }, []);

  const stopSession = useCallback(() => {
    setCurrentSession(prev => {
      const finalSession: Session = {
        ...prev,
        status: 'completed',
        endTime: Date.now(),
        totalTime: Date.now() - prev.startTime
      };

      // Save to history
      const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"sessions":[]}');
      history.sessions.push(finalSession);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

      // Create new session
      return createNewSession();
    });
  }, []);

  const addMob = useCallback((mobId: number) => {
    const mob = mobsData[mobId];
    if (!mob) return;

    setCurrentSession(prev => {
      if (prev.selectedMobs.some(m => m.mobId === mobId)) {
        return prev;
      }

      const sessionMob: SessionMob = {
        mobId,
        mobName: mob.name,
        drops: mob.drops.map(drop => ({
          itemId: drop.itemId,
          itemName: drop.name,
          itemEName: drop.eName,
          quantity: 0,
          npcValue: mobsData[mobId] ? 0 : 0, // Will be filled from itemsData
          customValue: undefined
        }))
      };

      return {
        ...prev,
        selectedMobs: [...prev.selectedMobs, sessionMob]
      };
    });
  }, [mobsData]);

  const removeMob = useCallback((mobId: number) => {
    setCurrentSession(prev => ({
      ...prev,
      selectedMobs: prev.selectedMobs.filter(m => m.mobId !== mobId)
    }));
  }, []);

  const updateDropQuantity = useCallback((mobId: number, itemId: number, quantity: number) => {
    setCurrentSession(prev => ({
      ...prev,
      selectedMobs: prev.selectedMobs.map(mob => {
        if (mob.mobId !== mobId) return mob;
        return {
          ...mob,
          drops: mob.drops.map(drop => {
            if (drop.itemId !== itemId) return drop;
            return { ...drop, quantity };
          })
        };
      })
    }));
  }, []);

  const updateCustomPrice = useCallback((mobId: number, itemId: number, price: number | undefined) => {
    setCurrentSession(prev => ({
      ...prev,
      selectedMobs: prev.selectedMobs.map(mob => {
        if (mob.mobId !== mobId) return mob;
        return {
          ...mob,
          drops: mob.drops.map(drop => {
            if (drop.itemId !== itemId) return drop;
            return { ...drop, customValue: price };
          })
        };
      })
    }));
  }, []);

  const updateDropsWithItemPrices = useCallback((itemsData: Record<string, any>) => {
    setCurrentSession(prev => ({
      ...prev,
      selectedMobs: prev.selectedMobs.map(mob => ({
        ...mob,
        drops: mob.drops.map(drop => ({
          ...drop,
          npcValue: itemsData[drop.itemId]?.valueSell || 0
        }))
      }))
    }));
  }, []);

  return {
    currentSession,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    addMob,
    removeMob,
    updateDropQuantity,
    updateCustomPrice,
    updateDropsWithItemPrices
  };
}

function createNewSession(): Session {
  return {
    id: `session-${Date.now()}`,
    name: `Sessão ${new Date().toLocaleString('pt-BR')}`,
    status: 'idle',
    startTime: 0,
    totalTime: 0,
    pausedTime: 0,
    selectedMobs: [],
    totalProfit: 0,
    profitPerHour: 0
  };
}

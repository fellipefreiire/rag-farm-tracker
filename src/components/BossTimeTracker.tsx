import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BossTimerEntry, Boss, TimerStatus } from '../types/index';
import { getBossList, getMVPList, getMiniList } from '../data/bossData';
import {
  getTimeRemaining,
  formatCountdown,
  hasRespawned,
  shouldAlert90,
  shouldAlert120,
} from '../utils/time';
import { playAlertSound } from '../utils/audio';
import { isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'ragBossTimers';

export function BossTimeTracker() {
  const navigate = useNavigate();
  const [bosses] = useState<Boss[]>(() => getBossList());
  const [mvps] = useState<Boss[]>(() => getMVPList());
  const [minis] = useState<Boss[]>(() => getMiniList());
  const [timers, setTimers] = useState<BossTimerEntry[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<'all' | 'mvp' | 'mini'>('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [killTimeInput, setKillTimeInput] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [timerBeingReset, setTimerBeingReset] = useState<string | null>(null);

  // Confirmation modal for remove
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [timerToRemove, setTimerToRemove] = useState<BossTimerEntry | null>(null);

  // Get user's timezone offset in hours
  const userTimezoneOffset = new Date().getTimezoneOffset() / -60;

  // Check if user is already in a room and redirect
  useEffect(() => {
    const stored = localStorage.getItem('currentRoom');
    if (stored && isSupabaseConfigured()) {
      // User has an active room, redirect to shared tracker
      navigate('/boss-tracker?room=active');
    }
  }, [navigate]);

  // Load timers from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved) as BossTimerEntry[];
        setTimers(data);
      } catch (e) {
        console.error('Error loading boss timers from localStorage:', e);
      }
    }
  }, []);

  // Save timers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  }, [timers]);

  // Update current time every second for countdown display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Check for alerts and remove expired timers every second
  useEffect(() => {
    const checkAlerts = () => {
      setTimers(prevTimers => {
        let updated = false;
        const newTimers = prevTimers
          .filter(timer => {
            // Remove timers that have reached 00:00 (180 minutes elapsed)
            const remaining = getTimeRemaining(timer.killTime);
            if (remaining === 0) {
              console.log('Auto-removing expired timer:', timer.bossName);
              updated = true;
              return false; // Remove from list
            }
            return true; // Keep in list
          })
          .map(timer => {
            let updatedTimer = { ...timer };

            // Check for 180 minute alert
            if (shouldAlert90(timer.killTime, timer.alert90Played)) {
              playAlertSound();
              updatedTimer.alert90Played = true;
              updated = true;
            }

            // Check for 180 minute alert
            if (shouldAlert120(timer.killTime, timer.alert120Played)) {
              playAlertSound();
              updatedTimer.alert120Played = true;
              updated = true;
            }

            return updatedTimer;
          });
        return updated ? newTimers : prevTimers;
      });
    };

    const interval = setInterval(checkAlerts, 1000); // Check every second
    return () => clearInterval(interval);
  }, []);

  const formatTimeWithZone = (date: Date, isUTC: boolean = false): string => {
    const hours = isUTC ? date.getUTCHours() : date.getHours();
    const minutes = isUTC ? date.getUTCMinutes() : date.getMinutes();
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    if (isUTC) {
      return `${timeStr} (UTC)`;
    } else {
      const offset = userTimezoneOffset;
      const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
      return `${timeStr} (UTC${offsetStr})`;
    }
  };

  const openModal = (boss: Boss) => {
    setSelectedBoss(boss);
    // Set current server time (UTC) as default
    const now = new Date();
    const hours = now.getUTCHours().toString().padStart(2, '0');
    const minutes = now.getUTCMinutes().toString().padStart(2, '0');
    setKillTimeInput(`${hours}:${minutes}`);
    setPlayerName('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBoss(null);
    setKillTimeInput('');
    setPlayerName('');
    setTimerBeingReset(null);
  };

  const handleConfirmTimer = () => {
    if (!selectedBoss || !killTimeInput) {
      alert('Por favor, insira o horário da morte.');
      return;
    }

    try {
      // Parse server time (UTC)
      const [hours, minutes] = killTimeInput.split(':').map(Number);
      const now = new Date();
      const killDate = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hours,
        minutes,
        0,
        0
      ));

      // If the kill time is in the future, assume it was yesterday
      if (killDate.getTime() > now.getTime()) {
        killDate.setUTCDate(killDate.getUTCDate() - 1);
      }

      const killTime = killDate.getTime();

      const newTimer: BossTimerEntry = {
        id: `${Date.now()}-${selectedBoss.id}`,
        bossId: selectedBoss.id,
        bossName: selectedBoss.name,
        killTime,
        killTimeUTC: formatTimeWithZone(new Date(killTime), true),
        killTimeLocal: formatTimeWithZone(new Date(killTime), false),
        respawnMinutes: selectedBoss.respawnTime,
        nextSpawnTime: killTime + 180 * 60 * 1000, // Always 180 minutes max
        playerName: playerName.trim() || undefined,
        alert90Played: false,
        alert120Played: false,
        createdAt: Date.now(),
      };

      // If resetting, remove the old timer first, then add new one
      if (timerBeingReset) {
        setTimers(prev => [...prev.filter(t => t.id !== timerBeingReset), newTimer]);
      } else {
        setTimers(prev => [...prev, newTimer]);
      }

      closeModal();
    } catch (error) {
      alert('Formato de horário inválido. Use HH:MM (ex: 20:30)');
    }
  };

  const handleResetTimer = (timer: BossTimerEntry) => {
    const boss = bosses.find(b => b.id === timer.bossId);
    if (boss) {
      // Store the timer ID that's being reset
      setTimerBeingReset(timer.id);
      // Open modal to register new kill time
      openModal(boss);
    }
  };

  const handleRemoveTimer = (timer: BossTimerEntry) => {
    setTimerToRemove(timer);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveTimer = () => {
    if (timerToRemove) {
      console.log('Removing timer:', timerToRemove.id, timerToRemove.bossName);
      setTimers(prev => prev.filter(t => t.id !== timerToRemove.id));
      setShowRemoveConfirm(false);
      setTimerToRemove(null);
    }
  };

  const cancelRemoveTimer = () => {
    setShowRemoveConfirm(false);
    setTimerToRemove(null);
  };

  const getTimerForBoss = (bossId: number): BossTimerEntry | undefined => {
    return timers.find(t => t.bossId === bossId);
  };

  const getTimerStatus = (timer: BossTimerEntry): TimerStatus => {
    const timeElapsed = Date.now() - timer.killTime;
    const alert90Time = 180 * 60 * 1000;

    if (hasRespawned(timer.killTime)) {
      return 'respawned';
    } else if (timeElapsed >= alert90Time) {
      return 'warning';
    }
    return 'active';
  };

  const getStatusText = (status: TimerStatus): string => {
    switch (status) {
      case 'active':
        return 'Aguardando';
      case 'warning':
        return 'ALERTA';
      case 'respawned':
        return 'RESPAWNOU';
    }
  };

  const getBossesToDisplay = () => {
    if (filterType === 'mvp') return mvps;
    if (filterType === 'mini') return minis;
    return bosses;
  };

  // Get sorted timers by remaining time (ascending - closest to respawn first)
  const getSortedTimers = () => {
    return [...timers]
      .map(timer => ({
        timer,
        boss: bosses.find(b => b.id === timer.bossId),
        remaining: getTimeRemaining(timer.killTime),
        status: getTimerStatus(timer),
      }))
      .sort((a, b) => a.remaining - b.remaining);
  };

  const displayBosses = getBossesToDisplay();
  const sortedTimers = getSortedTimers();

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="max-w-[1800px] h-full mx-auto px-4 py-4 flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate('/')}
              className="px-3 py-1.5 text-sm bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              ← Voltar
            </button>

            {/* Room Button - Only show if Supabase is configured */}
            {isSupabaseConfigured() && (
              <button
                onClick={() => navigate('/boss-tracker?room=new')}
                className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 border border-purple-500/50 rounded-lg text-sm font-bold transition-colors"
                title="Criar ou entrar em uma sala compartilhada"
              >
                🚪 Criar/Entrar Sala
              </button>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-1">⏱️ Boss Time Tracker</h1>
          <p className="text-sm text-gray-400">
            Horário Local: {formatTimeWithZone(currentTime)} | Servidor: {formatTimeWithZone(currentTime, true)}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 overflow-hidden">
          {/* LEFT COLUMN - Boss List (3/4 width) */}
          <div className="lg:col-span-3 flex flex-col overflow-hidden">
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-3 shadow-2xl flex flex-col h-full overflow-hidden">
              <h2 className="text-lg font-bold mb-3">📋 Lista de Bosses</h2>

              {/* Filter Buttons */}
              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                    filterType === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  Todos ({bosses.length})
                </button>
                <button
                  onClick={() => setFilterType('mvp')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                    filterType === 'mvp'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  👑 MVPs ({mvps.length})
                </button>
                <button
                  onClick={() => setFilterType('mini')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                    filterType === 'mini'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  ⭐ Mini ({minis.filter(m => !m.isMVP).length})
                </button>
              </div>

              {/* Boss Cards Grid - 4 columns */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-auto pr-2 flex-1">
                {displayBosses.map(boss => {
                  const timer = getTimerForBoss(boss.id);
                  const hasTimer = !!timer;

                  return (
                    <div
                      key={boss.id}
                      className={`bg-gradient-to-br ${
                        hasTimer
                          ? 'from-gray-700/30 to-gray-800/30 border-gray-600/40'
                          : 'from-gray-800/40 to-gray-900/40 border-gray-700/30'
                      } backdrop-blur-sm border rounded-lg p-2 transition-all hover:scale-[1.02]`}
                    >
                      {/* Boss Header */}
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-lg">{boss.isMVP ? '👑' : '⭐'}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold truncate">{boss.name}</h3>
                        </div>
                      </div>

                      {/* Boss Details */}
                      <div className="space-y-0.5 mb-2 text-[10px] text-gray-400">
                        <p className="truncate">📍 {boss.mapLocation || 'Desc.'}</p>
                        <p>⏱️ 180m</p>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => openModal(boss)}
                        disabled={hasTimer}
                        className={`w-full px-2 py-1.5 rounded text-[10px] font-bold transition-colors ${
                          hasTimer
                            ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {hasTimer ? '✓' : '⚔️'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - Active Timers History (1/4 width) */}
          <div className="lg:col-span-1 flex flex-col overflow-hidden">
            <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 backdrop-blur-sm border border-red-500/30 rounded-2xl p-4 shadow-2xl flex flex-col h-full overflow-hidden">
              <h2 className="text-lg font-bold mb-3">
                🔥 Next Boss(es) ({timers.length})
              </h2>

              {sortedTimers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Nenhum boss rastreado</p>
                  <p className="text-xs mt-1">Registre mortes</p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto pr-2 flex-1">
                  {sortedTimers.map(({ timer, boss, remaining, status }) => {
                    // Status-based styling
                    let bgClass = 'from-green-900/20 to-green-800/20';
                    let borderClass = 'border-green-500/30';
                    let badgeClass = 'bg-green-500/20 text-green-300';

                    if (status === 'warning') {
                      bgClass = 'from-yellow-900/20 to-yellow-800/20';
                      borderClass = 'border-yellow-500/30';
                      badgeClass = 'bg-yellow-500/20 text-yellow-300';
                    } else if (status === 'respawned') {
                      bgClass = 'from-red-900/20 to-red-800/20';
                      borderClass = 'border-red-500/30';
                      badgeClass = 'bg-red-500/20 text-red-300';
                    }

                    return (
                      <div
                        key={timer.id}
                        className={`bg-gradient-to-r ${bgClass} border ${borderClass} rounded-lg p-2 transition-all`}
                      >
                        {/* Two Column Layout */}
                        <div className="flex gap-2">
                          {/* LEFT: Timer and Complete Button */}
                          <div className="flex flex-col items-center gap-1.5 min-w-[95px]">
                            {/* Timer Square */}
                            <div className="bg-black/50 rounded px-2 py-3 w-full">
                              <div className="text-center text-sm font-mono font-bold tracking-wide">
                                {formatCountdown(remaining)}
                              </div>
                            </div>

                            {/* Status Badge - only show warning and respawned */}
                            {status !== 'active' && (
                              <span className={`px-2 py-0.5 ${badgeClass} text-[9px] font-bold rounded whitespace-nowrap w-full text-center`}>
                                {getStatusText(status)}
                              </span>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-1 w-full">
                              <button
                                onClick={() => handleResetTimer(timer)}
                                className="flex-1 px-2 py-1 bg-blue-600/40 hover:bg-blue-600/70 rounded text-xs transition-colors font-medium"
                                title="Resetar timer - registrar nova morte"
                              >
                                ↻
                              </button>
                              <button
                                onClick={() => handleRemoveTimer(timer)}
                                className="flex-1 px-2 py-1 bg-red-600/40 hover:bg-red-600/70 rounded text-xs transition-colors font-medium"
                                title="Remover timer"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          {/* RIGHT: Boss Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            {/* Boss Header */}
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-base">{boss?.isMVP ? '👑' : '⭐'}</span>
                              <h3 className="text-sm font-bold truncate">{timer.bossName}</h3>
                            </div>

                            {/* Info */}
                            <div className="space-y-0.5 text-xs text-gray-300">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Local:</span>
                                <span className="font-medium">{timer.killTimeLocal}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Servidor:</span>
                                <span className="font-medium">{timer.killTimeUTC}</span>
                              </div>
                              {timer.playerName && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Player:</span>
                                  <span className="font-medium truncate ml-1">👤 {timer.playerName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedBoss && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-3xl">{selectedBoss.isMVP ? '👑' : '⭐'}</span>
              {selectedBoss.name}
            </h2>

            <div className="space-y-4 mb-6">
              {/* Kill Time Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Horário da Morte (Servidor/UTC) <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  value={killTimeInput}
                  onChange={(e) => setKillTimeInput(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Servidor atual: {formatTimeWithZone(currentTime, true)}
                </p>
              </div>

              {/* Player Name Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome do Player (Opcional)
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Quem matou o boss?"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500 text-white"
                />
              </div>

              {/* Boss Info */}
              <div className="text-sm text-gray-400 bg-gray-900/30 rounded-lg p-3">
                <p>📍 {selectedBoss.mapLocation || 'Localização desconhecida'}</p>
                <p>⏱️ Respawn: {selectedBoss.respawnTime} minutos</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmTimer}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors"
              >
                ✓ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && timerToRemove && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-red-400 flex items-center gap-2">
              <span className="text-3xl">⚠️</span>
              Confirmar Remoção
            </h2>

            <p className="text-white mb-6">
              Tem certeza que deseja remover o timer de{' '}
              <span className="font-bold text-red-400">{timerToRemove.bossName}</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelRemoveTimer}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRemoveTimer}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
              >
                ✓ Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

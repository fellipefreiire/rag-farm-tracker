import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Boss, TimerStatus } from '../types/index';
import type { SharedBossTimer } from '../types/room';
import { getBossList, getMVPList, getMiniList } from '../data/bossData';
import {
  getTimeRemaining,
  formatCountdown,
  hasRespawned,
} from '../utils/time';
import { useRoom } from '../hooks/useRoom';
import { useRealtimeTimers } from '../hooks/useRealtimeTimers';
import { RoomManager } from './RoomManager';
import { RoomHeader } from './RoomHeader';

export function SharedBossTimeTracker() {
  const navigate = useNavigate();
  const [bosses] = useState<Boss[]>(() => getBossList());
  const [mvps] = useState<Boss[]>(() => getMVPList());
  const [minis] = useState<Boss[]>(() => getMiniList());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<'all' | 'mvp' | 'mini'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal states
  const [showRoomManager, setShowRoomManager] = useState(false);
  const [showBossModal, setShowBossModal] = useState(false);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [killTimeInput, setKillTimeInput] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [hasCheckedReconnect, setHasCheckedReconnect] = useState(false);

  // Room hooks
  const { room, member, members, isConnected, isLoading: roomLoading, error: roomError, createRoom, joinRoom, leaveRoom } = useRoom();

  // Timers hook
  const { timers, addTimer, removeTimer } = useRealtimeTimers({
    roomId: room?.id || null,
    member,
  });

  // Get user timezone offset
  const userTimezoneOffset = new Date().getTimezoneOffset() / -60;

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Check if user should show room manager after reconnect attempt
  useEffect(() => {
    if (!roomLoading && !hasCheckedReconnect) {
      setHasCheckedReconnect(true);
      if (!isConnected) {
        // No stored room or reconnection failed, show room manager
        setShowRoomManager(true);
      }
    }
  }, [roomLoading, isConnected, hasCheckedReconnect]);

  // Close room manager when connected
  useEffect(() => {
    if (isConnected) {
      setShowRoomManager(false);
    }
  }, [isConnected]);

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

  const openBossModal = (boss: Boss) => {
    setSelectedBoss(boss);
    const now = new Date();
    const hours = now.getUTCHours().toString().padStart(2, '0');
    const minutes = now.getUTCMinutes().toString().padStart(2, '0');
    setKillTimeInput(`${hours}:${minutes}`);
    setPlayerName('');
    setShowBossModal(true);
  };

  const closeBossModal = () => {
    setShowBossModal(false);
    setSelectedBoss(null);
    setKillTimeInput('');
    setPlayerName('');
  };

  const handleConfirmTimer = async () => {
    if (!selectedBoss || !killTimeInput) {
      alert('Por favor, insira o horário da morte.');
      return;
    }

    // Upsert will automatically replace any existing timer for this boss
    const success = await addTimer(selectedBoss, killTimeInput, playerName);

    if (success) {
      closeBossModal();
    } else {
      alert('Erro ao adicionar timer. Tente novamente.');
    }
  };

  const handleResetTimer = (timer: SharedBossTimer) => {
    const boss = bosses.find(b => b.id === timer.boss_id);
    if (boss) {
      // Simply open modal - upsert will replace the existing timer
      openBossModal(boss);
    }
  };

  const handleRemoveTimer = async (timer: SharedBossTimer) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja remover o timer de ${timer.boss_name}?`
    );

    if (confirmed) {
      await removeTimer(timer.id);
    }
  };

  const getTimerForBoss = (bossId: number): SharedBossTimer | undefined => {
    return timers.find(t => t.boss_id === bossId);
  };

  const getTimerStatus = (timer: SharedBossTimer): TimerStatus => {
    const timeElapsed = Date.now() - timer.kill_time;
    const alert90Time = 90 * 60 * 1000;

    if (hasRespawned(timer.kill_time)) {
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
    let filtered = bosses;

    // Filter by type
    if (filterType === 'mvp') filtered = mvps;
    if (filterType === 'mini') filtered = minis;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(boss =>
        boss.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (boss.mapLocation && boss.mapLocation.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  const getSortedTimers = () => {
    return [...timers]
      .map(timer => ({
        timer,
        boss: bosses.find(b => b.id === timer.boss_id),
        remaining: getTimeRemaining(timer.kill_time),
        status: getTimerStatus(timer),
      }))
      .sort((a, b) => a.remaining - b.remaining);
  };

  const displayBosses = getBossesToDisplay();
  const sortedTimers = getSortedTimers();

  // Show loading while checking for stored room
  if (roomLoading && !isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Reconectando à sala...</p>
        </div>
      </div>
    );
  }

  // Show room manager only if not connected and user wants to join/create
  if (showRoomManager && !isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <RoomManager
          onCreateRoom={async (roomName, password, displayName) => {
            return await createRoom({ roomName, password, displayName });
          }}
          onJoinRoom={async (roomId, password, displayName) => {
            return await joinRoom({ roomId, password, displayName });
          }}
          onClose={() => navigate('/boss-tracker')}
          isLoading={roomLoading}
          error={roomError}
        />
      </div>
    );
  }

  // If not connected and no room manager shown, redirect to local tracker
  if (!isConnected) {
    navigate('/boss-tracker');
    return null;
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="max-w-[1800px] h-full mx-auto px-4 py-4 flex flex-col">
        {/* Room Header */}
        {room && member && (
          <RoomHeader
            room={room}
            member={member}
            members={members}
            currentTime={currentTime}
            userTimezoneOffset={userTimezoneOffset}
            onLeaveRoom={async () => {
              await leaveRoom();
              // Force show room manager after leaving
              setTimeout(() => setShowRoomManager(true), 100);
            }}
          />
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 overflow-hidden">
          {/* LEFT COLUMN - Boss List (3/4 width) */}
          <div className="lg:col-span-3 flex flex-col overflow-hidden">
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-3 shadow-2xl flex flex-col h-full overflow-hidden">
              <h2 className="text-lg font-bold mb-3">📋 Lista de Bosses</h2>

              {/* Search Input */}
              <div className="mb-3 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Buscar boss por nome ou mapa..."
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
                    title="Limpar busca"
                  >
                    ✕
                  </button>
                )}
              </div>

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

              {/* Boss Cards Grid */}
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
                      style={
                        hasTimer && timer
                          ? { borderLeftWidth: '4px', borderLeftColor: timer.added_by_color }
                          : {}
                      }
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
                        <p>⏱️ 90-120m</p>
                        {hasTimer && timer && (
                          <p className="text-gray-300" title={`Adicionado por ${timer.added_by_display_name}`}>
                            👤 {timer.added_by_display_name}
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => openBossModal(boss)}
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

          {/* RIGHT COLUMN - Active Timers (1/4 width) */}
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
                        style={{ borderLeftWidth: '4px', borderLeftColor: timer.added_by_color }}
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
                              <h3 className="text-sm font-bold truncate">{timer.boss_name}</h3>
                            </div>

                            {/* Info */}
                            <div className="space-y-0.5 text-xs text-gray-300">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Local:</span>
                                <span className="font-medium">{timer.kill_time_local}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Servidor:</span>
                                <span className="font-medium">{timer.kill_time_utc}</span>
                              </div>
                              {timer.player_name && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Player:</span>
                                  <span className="font-medium truncate ml-1">👤 {timer.player_name}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">Por:</span>
                                <span className="font-medium truncate ml-1" style={{ color: timer.added_by_color }}>
                                  {timer.added_by_display_name}
                                </span>
                              </div>
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

      {/* Boss Modal */}
      {showBossModal && selectedBoss && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-3xl">{selectedBoss.isMVP ? '👑' : '⭐'}</span>
              {selectedBoss.name}
            </h2>

            <div className="space-y-4 mb-6">
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

              <div className="text-sm text-gray-400 bg-gray-900/30 rounded-lg p-3">
                <p>📍 {selectedBoss.mapLocation || 'Localização desconhecida'}</p>
                <p>⏱️ Respawn: 90-120 minutos</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeBossModal}
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
    </div>
  );
}

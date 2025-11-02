import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Room, RoomMember } from '../types/room';
import { generateRoomLink, copyToClipboard } from '../utils/room';
import { getUserInitials, getContrastColor } from '../utils/colors';

interface RoomHeaderProps {
  room: Room;
  member: RoomMember;
  members: RoomMember[];
  onLeaveRoom: () => void;
  currentTime: Date;
  userTimezoneOffset: number;
}

export function RoomHeader({ room, member, members, onLeaveRoom, currentTime, userTimezoneOffset }: RoomHeaderProps) {
  const navigate = useNavigate();
  const [linkCopied, setLinkCopied] = useState(false);

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

  const handleCopyLink = async () => {
    const link = generateRoomLink(room.id);
    await copyToClipboard(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleLeave = () => {
    if (confirm('Tem certeza que deseja sair da sala?')) {
      onLeaveRoom();
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 shadow-lg mb-4">
      {/* Title and Time */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">⏱️ Boss Time Tracker</h1>
        <p className="text-sm text-gray-400">
          Horário Local: {formatTimeWithZone(currentTime)} | Servidor: {formatTimeWithZone(currentTime, true)}
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Room Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🚪</span>
            <h2 className="text-base font-bold text-white">{room.name}</h2>
          </div>

          {/* Members */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">Membros online:</span>
            {members.map(m => {
              const initials = getUserInitials(m.display_name);
              const textColor = getContrastColor(m.user_color);

              return (
                <div
                  key={m.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full border"
                  style={{
                    backgroundColor: `${m.user_color}20`,
                    borderColor: `${m.user_color}60`,
                  }}
                  title={m.display_name}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      backgroundColor: m.user_color,
                      color: textColor,
                    }}
                  >
                    {initials}
                  </div>
                  <span className="text-xs font-medium text-gray-200">{m.display_name}</span>
                  {m.id === member.id && (
                    <span className="text-[10px] text-gray-400">(você)</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/')}
            className="px-3 py-2 bg-gray-600/50 hover:bg-gray-600/70 rounded-lg text-sm font-bold transition-colors border border-gray-500/50"
            title="Voltar para home"
          >
            ← Voltar
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3 py-2 bg-blue-600/50 hover:bg-blue-600/70 rounded-lg text-sm font-bold transition-colors border border-blue-500/50"
            title="Copiar link da sala"
          >
            {linkCopied ? '✓ Copiado!' : '📋 Copiar Link'}
          </button>

          <button
            onClick={handleLeave}
            className="px-3 py-2 bg-red-600/50 hover:bg-red-600/70 rounded-lg text-sm font-bold transition-colors border border-red-500/50"
            title="Sair da sala"
          >
            🚪 Sair
          </button>
        </div>
      </div>
    </div>
  );
}

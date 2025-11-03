import { useState } from 'react';
import { generateRoomLink, copyToClipboard, getRoomIdFromUrl } from '../utils/room';

interface RoomManagerProps {
  onCreateRoom: (roomName: string, password: string, displayName: string) => Promise<{ success: boolean; roomId: string | null }>;
  onJoinRoom: (roomId: string, password: string, displayName: string) => Promise<{ success: boolean }>;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}

export function RoomManager({ onCreateRoom, onJoinRoom, onClose, isLoading, error }: RoomManagerProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(() => {
    // Auto-select join tab if room ID in URL
    return getRoomIdFromUrl() ? 'join' : 'create';
  });

  // Create room state
  const [createRoomName, setCreateRoomName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createDisplayName, setCreateDisplayName] = useState('');

  // Join room state
  const [joinRoomId, setJoinRoomId] = useState(getRoomIdFromUrl() || '');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinDisplayName, setJoinDisplayName] = useState('');

  // Success state
  const [createdRoomLink, setCreatedRoomLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCreateRoom = async () => {
    const result = await onCreateRoom(createRoomName, createPassword, createDisplayName);

    if (result.success && result.roomId) {
      const link = generateRoomLink(result.roomId);
      setCreatedRoomLink(link);
    }
  };

  const handleJoinRoom = async () => {
    const result = await onJoinRoom(joinRoomId, joinPassword, joinDisplayName);

    if (result.success) {
      onClose();
    }
  };

  const handleCopyLink = async () => {
    if (createdRoomLink) {
      await copyToClipboard(createdRoomLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // If room was created successfully, show link
  if (createdRoomLink) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-green-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <h2 className="text-2xl font-bold text-green-400 mb-4">✓ Sala Criada!</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Compartilhe este link com outros jogadores:</p>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 break-all text-sm text-gray-300">
                {createdRoomLink}
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors"
            >
              {linkCopied ? '✓ Link Copiado!' : '📋 Copiar Link'}
            </button>

            <button
              onClick={() => {
                setCreatedRoomLink(null);
                onClose();
              }}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors"
            >
              Continuar para Sala
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">🚪 Gerenciar Sala</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            Criar Sala
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
              activeTab === 'join'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            Entrar em Sala
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Create Room Form */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Nome da Sala <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={createRoomName}
                onChange={(e) => setCreateRoomName(e.target.value)}
                placeholder="Ex: Farm Geral - Odin"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-gray-500"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Senha da Sala <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-gray-500"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Seu Nome de Exibição <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={createDisplayName}
                onChange={(e) => setCreateDisplayName(e.target.value)}
                placeholder="Ex: João"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-gray-500"
                maxLength={30}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={isLoading || !createRoomName || !createPassword || !createDisplayName}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Criando...' : 'Criar Sala'}
              </button>
            </div>
          </div>
        )}

        {/* Join Room Form */}
        {activeTab === 'join' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                ID da Sala ou Link <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => {
                  const value = e.target.value;
                  // Extract room ID from pasted link
                  if (value.includes('?room=')) {
                    const match = value.match(/room=([a-f0-9-]+)/);
                    if (match) {
                      setJoinRoomId(match[1]);
                      return;
                    }
                  }
                  setJoinRoomId(value);
                }}
                placeholder="Cole o link ou ID da sala"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Senha da Sala <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                placeholder="Senha fornecida pelo criador"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Seu Nome de Exibição <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={joinDisplayName}
                onChange={(e) => setJoinDisplayName(e.target.value)}
                placeholder="Ex: Fusquetinha"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-white placeholder-gray-500"
                maxLength={30}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleJoinRoom}
                disabled={isLoading || !joinRoomId || !joinPassword || !joinDisplayName}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Entrando...' : 'Entrar na Sala'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

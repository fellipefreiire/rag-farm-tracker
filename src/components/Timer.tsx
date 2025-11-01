import { useEffect, useState } from 'react';
import { formatDuration } from '../utils/time';
import type { SessionStatus } from '../types';

interface TimerProps {
  status: SessionStatus;
  totalTime: number;
  pausedTime: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function Timer({
  status,
  totalTime,
  pausedTime,
  onStart,
  onPause,
  onResume,
  onStop
}: TimerProps) {
  const [displayTime, setDisplayTime] = useState(totalTime);

  useEffect(() => {
    if (status === 'running') {
      const interval = setInterval(() => {
        setDisplayTime(prev => prev + 1000);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setDisplayTime(totalTime - pausedTime);
    }
  }, [status, totalTime, pausedTime]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="text-center mb-4">
        <h2 className="text-sm font-medium text-gray-600 mb-2">Tempo de Sessão</h2>
        <div className="text-5xl font-bold text-blue-600 font-mono">
          {formatDuration(displayTime)}
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        {status === 'idle' && (
          <button
            onClick={onStart}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Iniciar Sessão
          </button>
        )}

        {status === 'running' && (
          <>
            <button
              onClick={onPause}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
            >
              Pausar
            </button>
            <button
              onClick={onStop}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Encerrar
            </button>
          </>
        )}

        {status === 'paused' && (
          <>
            <button
              onClick={onResume}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Retomar
            </button>
            <button
              onClick={onStop}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Encerrar
            </button>
          </>
        )}
      </div>

      {status !== 'idle' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Status:</span>
            <span className="font-medium">
              {status === 'running' ? '🟢 Ativa' : status === 'paused' ? '🟡 Pausada' : '⚪ Encerrada'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

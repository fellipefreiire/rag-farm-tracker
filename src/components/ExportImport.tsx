import { useRef } from 'react';
import { exportToJSON, exportToCSV, exportSessionDetails, importFromJSON } from '../utils/export';
import type { Session } from '../types';

interface ExportImportProps {
  currentSession: Session;
  onImport: (sessions: Session[]) => void;
}

export function ExportImport({ currentSession, onImport }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const sessions = await importFromJSON(file);
      onImport(sessions);
      alert(`${sessions.length} sessão(ões) importada(s) com sucesso!`);
    } catch (error) {
      alert(`Erro ao importar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportCurrentJSON = () => {
    if (currentSession.status === 'idle') {
      alert('Inicie uma sessão antes de exportar');
      return;
    }
    exportToJSON([currentSession]);
  };

  const handleExportCurrentCSV = () => {
    if (currentSession.status === 'idle') {
      alert('Inicie uma sessão antes de exportar');
      return;
    }
    exportToCSV([currentSession]);
  };

  const handleExportDetails = () => {
    if (currentSession.status === 'idle') {
      alert('Inicie uma sessão antes de exportar');
      return;
    }
    exportSessionDetails(currentSession);
  };

  const handleExportAllHistory = () => {
    const history = JSON.parse(localStorage.getItem('rag-farm-sessions') || '{"sessions":[]}');
    if (history.sessions.length === 0) {
      alert('Nenhuma sessão no histórico');
      return;
    }
    exportToJSON(history.sessions);
  };

  const handleExportAllHistoryCSV = () => {
    const history = JSON.parse(localStorage.getItem('rag-farm-sessions') || '{"sessions":[]}');
    if (history.sessions.length === 0) {
      alert('Nenhuma sessão no histórico');
      return;
    }
    exportToCSV(history.sessions);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Export / Import</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Sessão Atual</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportCurrentJSON}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              📥 Export JSON
            </button>
            <button
              onClick={handleExportCurrentCSV}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              📊 Export CSV
            </button>
            <button
              onClick={handleExportDetails}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
            >
              📋 Export Detalhes
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Histórico Completo</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportAllHistory}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
            >
              📥 Export Tudo (JSON)
            </button>
            <button
              onClick={handleExportAllHistoryCSV}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
            >
              📊 Export Tudo (CSV)
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Importar Dados</h3>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors cursor-pointer text-sm"
            >
              📤 Importar JSON
            </label>
            <span className="text-sm text-gray-500">
              Apenas arquivos .json exportados por este app
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

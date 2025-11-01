import { useState, useRef } from 'react';
import type { ComparisonReport } from '../types/comparison';
import { parseCSV } from '../utils/csvParser';
import { ComparisonDashboard } from './ComparisonDashboard';
import { ComparisonTable } from './ComparisonTable';
import { ComparisonCharts } from './ComparisonCharts';

interface ReportComparisonProps {
  reports: ComparisonReport[];
  onAddReports: (reports: ComparisonReport[]) => void;
  onBack: () => void;
}

type TabType = 'dashboard' | 'table' | 'charts';

export function ReportComparison({ reports, onAddReports, onBack }: ReportComparisonProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const newReports: ComparisonReport[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.name.endsWith('.csv')) {
        alert(`Arquivo ${file.name} não é um CSV`);
        continue;
      }

      try {
        const text = await file.text();
        const report = parseCSV(text, file.name);

        if (report) {
          newReports.push(report);
        } else {
          alert(`Erro ao processar ${file.name}`);
        }
      } catch (error) {
        console.error(`Erro ao ler ${file.name}:`, error);
        alert(`Erro ao ler ${file.name}`);
      }
    }

    if (newReports.length > 0) {
      // Limit to 10 reports total
      const updatedReports = [...reports, ...newReports].slice(0, 10);
      onAddReports(updatedReports);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleRemoveReport = (id: string) => {
    onAddReports(reports.filter(r => r.id !== id));
  };

  const handleUpdateLabel = (id: string, newLabel: string) => {
    onAddReports(reports.map(r =>
      r.id === id ? { ...r, label: newLabel } : r
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Comparação de Relatórios
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Compare a efetividade de diferentes sessões de farm
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
          >
            ← Voltar
          </button>
        </div>

        {/* Upload Area */}
        <div
          className={`mb-6 border-4 border-dashed rounded-2xl p-8 text-center transition-all ${
            isDragging
              ? 'border-purple-500 bg-purple-100'
              : 'border-purple-300 bg-white'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />

          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Arraste arquivos CSV aqui
          </h3>
          <p className="text-gray-600 mb-4">
            ou clique no botão abaixo para selecionar
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            Selecionar Arquivos CSV
          </button>
          <p className="text-sm text-gray-500 mt-4">
            {reports.length} de 10 relatórios carregados
          </p>
        </div>

        {/* Loaded Reports */}
        {reports.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Relatórios Carregados ({reports.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-md"
                >
                  <div className="flex items-start justify-between mb-2">
                    <input
                      type="text"
                      value={report.label}
                      onChange={(e) => handleUpdateLabel(report.id, e.target.value)}
                      className="font-semibold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-purple-300 focus:border-purple-500 focus:outline-none flex-1"
                    />
                    <button
                      onClick={() => handleRemoveReport(report.id)}
                      className="ml-2 text-red-500 hover:text-red-700 font-bold text-xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>💰 {report.totalProfit.toLocaleString()}z total</div>
                    <div>⏱ {report.profitPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}z/h</div>
                    <div>⏰ {report.sessionDurationFormatted}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        {reports.length >= 1 && (
          <>
            <div className="mb-4 border-b-2 border-purple-200 bg-white rounded-t-2xl">
              <div className="flex gap-2 px-4">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-6 py-3 font-semibold transition-colors border-b-4 ${
                    activeTab === 'dashboard'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('table')}
                  className={`px-6 py-3 font-semibold transition-colors border-b-4 ${
                    activeTab === 'table'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📋 Tabela
                </button>
                <button
                  onClick={() => setActiveTab('charts')}
                  className={`px-6 py-3 font-semibold transition-colors border-b-4 ${
                    activeTab === 'charts'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📈 Gráficos
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-xl p-6">
              {activeTab === 'dashboard' && <ComparisonDashboard reports={reports} />}
              {activeTab === 'table' && <ComparisonTable reports={reports} />}
              {activeTab === 'charts' && <ComparisonCharts reports={reports} />}
            </div>
          </>
        )}

        {/* Empty State */}
        {reports.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Nenhum relatório carregado
            </h3>
            <p className="text-gray-600">
              Faça upload de pelo menos 2 relatórios CSV para começar a comparação
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mobsData from '../data/mobs.json';
import mobsIndex from '../data/mobs-index.json';
import itemsData from '../data/items.json';
import type { Mob, MobIndex, Item } from '../types';
import type { ComparisonReport } from '../types/comparison';
import { FarmSession } from './FarmSession';
import { ReportModal } from './ReportModal';
import { ReportComparison } from './ReportComparison';

type ViewMode = 'selection' | 'session' | 'comparison';

export function FarmTrackerApp() {
  const navigate = useNavigate();
  const mobs = mobsData as Record<string, Mob>;
  const mobsList = mobsIndex as MobIndex[];
  const items = itemsData as Record<string, Item>;
  const [selectedMobIds, setSelectedMobIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMobId, setExpandedMobId] = useState<number | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [view, setView] = useState<ViewMode>('selection');
  const [comparisonReports, setComparisonReports] = useState<ComparisonReport[]>([]);

  // Timer states (moved from FarmSession for persistence)
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused' | 'finished'>('idle');
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [timerElapsed, setTimerElapsed] = useState(0);
  const [timerPausedTotal, setTimerPausedTotal] = useState(0);
  const [timerLastPause, setTimerLastPause] = useState<number | null>(null);

  // Drop tracking states
  const [dropQuantities, setDropQuantities] = useState<Record<number, number>>({});
  const [customPrices, setCustomPrices] = useState<Record<number, number>>({});

  // Current time for timer display
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Report modal state
  const [reportData, setReportData] = useState<ReturnType<typeof generateReport> | null>(null);

  // Track if there's a saved session
  const [hasSavedSession, setHasSavedSession] = useState(false);

  // LocalStorage functions
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('ragFarmSession');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTimerStatus(data.timerStatus || 'idle');
        setTimerStartTime(data.timerStartTime || null);
        setTimerElapsed(data.timerElapsed || 0);
        setTimerPausedTotal(data.timerPausedTotal || 0);
        setTimerLastPause(data.timerLastPause || null);
        setDropQuantities(data.dropQuantities || {});
        setCustomPrices(data.customPrices || {});
        setSelectedMobIds(data.selectedMobIds || []);
        setSessionActive(data.sessionActive || false);
        setHasSavedSession(true);
        return true;
      } catch (e) {
        console.error('Error loading from localStorage:', e);
        setHasSavedSession(false);
        return false;
      }
    }
    setHasSavedSession(false);
    return false;
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('ragFarmSession');
    // Reset all states
    setTimerStatus('idle');
    setTimerStartTime(null);
    setTimerElapsed(0);
    setTimerPausedTotal(0);
    setTimerLastPause(null);
    setDropQuantities({});
    setCustomPrices({});
    setSelectedMobIds([]);
    setSessionActive(false);
    setReportData(null);
    setHasSavedSession(false);
  };

  // Load from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Save to localStorage whenever relevant states change
  useEffect(() => {
    const sessionData = {
      timerStatus,
      timerStartTime,
      timerElapsed,
      timerPausedTotal,
      timerLastPause,
      dropQuantities,
      customPrices,
      selectedMobIds,
      sessionActive
    };
    localStorage.setItem('ragFarmSession', JSON.stringify(sessionData));
    // Only mark as "saved session" if there's actually an active session
    setHasSavedSession(sessionActive || timerStatus !== 'idle');
  }, [timerStatus, timerStartTime, timerElapsed, timerPausedTotal, timerLastPause, dropQuantities, customPrices, selectedMobIds, sessionActive]);

  // Timer effect - runs in background even when not on farm session view
  useEffect(() => {
    let interval: number | undefined;

    if (timerStatus === 'running') {
      interval = window.setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStatus]);

  // Calculate elapsed time
  const getElapsedTime = () => {
    if (!timerStartTime) return 0;
    if (timerStatus === 'running') {
      return currentTime - timerStartTime - timerPausedTotal;
    }
    return timerElapsed;
  };

  // Timer control functions
  const handleStartTimer = () => {
    setTimerStartTime(Date.now());
    setTimerStatus('running');
  };

  const handlePauseTimer = () => {
    setTimerLastPause(Date.now());
    setTimerElapsed(getElapsedTime());
    setTimerStatus('paused');
  };

  const handleResumeTimer = () => {
    if (timerLastPause) {
      setTimerPausedTotal(timerPausedTotal + (Date.now() - timerLastPause));
    }
    setTimerStatus('running');
  };

  const handleFinishTimer = () => {
    setTimerElapsed(getElapsedTime());
    setTimerStatus('finished');
  };

  const handleShowReport = () => {
    if (timerStatus === 'finished') {
      const report = generateReport();
      setReportData(report);
    }
  };

  // Generate detailed report
  const generateReport = () => {
    const elapsed = getElapsedTime();
    const hours = elapsed / (1000 * 60 * 60);

    // Get all unique drops from selected mobs
    const allDrops = selectedMobIds.flatMap(mobId => {
      const mob = mobs[mobId];
      return mob?.drops || [];
    });
    const uniqueDrops = Array.from(
      new Map(allDrops.map(drop => [drop.itemId, drop])).values()
    );

    // Calculate profit per item (only items with quantity > 0)
    let totalProfit = 0;
    const itemAnalysis = uniqueDrops
      .map(drop => {
        const quantity = dropQuantities[drop.itemId] || 0;
        if (quantity === 0) return null;

        const itemInfo = items[drop.itemId];
        const npcValue = itemInfo?.valueSell || 0;
        const customValue = customPrices[drop.itemId];
        const value = customValue !== undefined ? customValue : npcValue;
        const total = quantity * value;
        const profitPerHour = hours > 0 ? total / hours : total;

        totalProfit += total;

        return {
          itemName: drop.eName,
          quantity,
          unitPrice: value,
          totalProfit: total,
          profitPerHour,
          dropRate: drop.rate,
          isCustomPrice: customValue !== undefined
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.totalProfit - a.totalProfit);

    // Calculate percentages
    const itemAnalysisWithPercentage = itemAnalysis.map(item => ({
      ...item,
      percentOfTotal: totalProfit > 0 ? (item.totalProfit / totalProfit) * 100 : 0
    }));

    const totalProfitPerHour = hours > 0 ? totalProfit / hours : totalProfit;
    const mostProfitableItem = itemAnalysisWithPercentage[0] || null;

    return {
      sessionDuration: elapsed,
      sessionDurationFormatted: formatTime(elapsed),
      totalProfit,
      totalProfitPerHour,
      itemAnalysis: itemAnalysisWithPercentage,
      mostProfitableItem,
      selectedMobs: selectedMobIds.map(id => ({
        id,
        name: mobs[id]?.name || 'Unknown'
      }))
    };
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Drop tracking functions
  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    setDropQuantities(prev => ({ ...prev, [itemId]: Math.max(0, quantity) }));
  };

  const handleUpdateCustomPrice = (itemId: number, price: number | undefined) => {
    setCustomPrices(prev => {
      if (price === undefined) {
        const newPrices = { ...prev };
        delete newPrices[itemId];
        return newPrices;
      }
      return { ...prev, [itemId]: price };
    });
  };

  // Report functions
  const handleCloseReport = () => {
    setReportData(null);
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    let csv = 'Item,Quantidade,Preço Unitário,Lucro Total,Lucro/Hora,% do Total,Drop Rate\n';

    reportData.itemAnalysis.forEach(item => {
      csv += `"${item.itemName}",${item.quantity},${item.unitPrice},${item.totalProfit},${item.profitPerHour.toFixed(0)},${item.percentOfTotal.toFixed(1)}%,${item.dropRate.toFixed(2)}%\n`;
    });

    csv += '\n';
    csv += `Lucro Total,${reportData.totalProfit}\n`;
    csv += `Lucro por Hora,${reportData.totalProfitPerHour.toFixed(0)}\n`;
    csv += `Duração,${reportData.sessionDurationFormatted}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `farm-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = () => {
    if (!reportData) return;

    let text = '=== RELATÓRIO DE FARM ===\n\n';
    text += `Duração: ${reportData.sessionDurationFormatted}\n`;
    text += `Lucro Total: ${reportData.totalProfit.toLocaleString()}z\n`;
    text += `Lucro por Hora: ${reportData.totalProfitPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}z/h\n\n`;

    if (reportData.mostProfitableItem) {
      text += `Item Mais Lucrativo: ${reportData.mostProfitableItem.itemName} (${reportData.mostProfitableItem.percentOfTotal.toFixed(1)}% do lucro)\n\n`;
    }

    text += 'Mobs Caçados:\n';
    reportData.selectedMobs.forEach(mob => {
      text += `  - ${mob.name}\n`;
    });

    text += '\nAnálise por Item:\n';
    reportData.itemAnalysis.forEach(item => {
      text += `\n${item.itemName}:\n`;
      text += `  Quantidade: ${item.quantity}\n`;
      text += `  Preço Unit.: ${item.unitPrice.toLocaleString()}z${item.isCustomPrice ? ' (custom)' : ''}\n`;
      text += `  Lucro Total: ${item.totalProfit.toLocaleString()}z (${item.percentOfTotal.toFixed(1)}%)\n`;
      text += `  Lucro/Hora: ${item.profitPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}z/h\n`;
      text += `  Drop Rate: ${item.dropRate.toFixed(2)}%\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      alert('Relatório copiado para a área de transferência!');
    });
  };

  const filteredMobs = mobsList.filter(mob =>
    mob.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mob.jName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mob.id.toString().includes(searchTerm)
  ).slice(0, 50);

  const handleAddMob = (mobId: number) => {
    if (!selectedMobIds.includes(mobId)) {
      setSelectedMobIds([...selectedMobIds, mobId]);
    }
  };

  const handleRemoveMob = (mobId: number) => {
    setSelectedMobIds(selectedMobIds.filter(id => id !== mobId));
  };

  const handleStartSession = () => {
    if (selectedMobIds.length > 0) {
      setSessionActive(true);
      setView('session');
    }
  };

  const handleBackToSelection = () => {
    setView('selection');
    setSessionActive(false);
  };

  const handleGoToComparison = () => {
    setView('comparison');
  };

  // Render based on view
  return (
    <>
      {view === 'comparison' ? (
        <ReportComparison
          reports={comparisonReports}
          onAddReports={setComparisonReports}
          onBack={() => setView('selection')}
        />
      ) : view === 'session' || sessionActive ? (
        <FarmSession
          selectedMobIds={selectedMobIds}
          mobs={mobs}
          items={items}
          onBack={handleBackToSelection}
          onShowReport={handleShowReport}
          timerStatus={timerStatus}
          timerStartTime={timerStartTime}
          timerElapsed={timerElapsed}
          timerPausedTotal={timerPausedTotal}
          onStartTimer={handleStartTimer}
          onPauseTimer={handlePauseTimer}
          onResumeTimer={handleResumeTimer}
          onFinishTimer={handleFinishTimer}
          dropQuantities={dropQuantities}
          customPrices={customPrices}
          onUpdateQuantity={handleUpdateQuantity}
          onUpdateCustomPrice={handleUpdateCustomPrice}
          currentTime={currentTime}
        />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
          {/* Back Button */}
          <div className="max-w-7xl mx-auto px-16 mb-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              ← Voltar
            </button>
          </div>

          <div className="max-w-7xl mx-auto px-16">
            {/* Header */}
            <header className="mb-8 text-center">
              <h1 className="text-5xl font-bold text-white mb-3">
                Farm Tracker
              </h1>
              <p className="text-lg text-gray-400">
                Selecione os mobs que você vai caçar
              </p>
            </header>

            {/* Comparison Navigation Card */}
            <div className="mb-6">
              <button
                onClick={handleGoToComparison}
                className="w-full py-4 bg-gradient-to-r from-purple-900/40 to-purple-800/40 hover:from-purple-900/60 hover:to-purple-800/60 border-2 border-purple-500/30 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div className="text-left">
                    <div className="text-lg font-bold text-purple-200">Comparar Relatórios</div>
                    <div className="text-sm text-purple-400">Compare a efetividade de diferentes sessões de farm</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Main Grid - 2 columns */}
            <div className="grid grid-cols-2 gap-12">
              {/* Left Side - Mob Selection */}
              <div className="bg-gray-800/50 rounded-2xl shadow-xl p-8 border border-purple-500/30">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Buscar Mobs
                </h2>

                <input
                  type="text"
                  placeholder="Digite o nome do mob..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 mb-6 transition-all text-white placeholder-gray-400"
                />

                <div className="h-[calc(100vh-400px)] overflow-y-auto border-2 border-gray-700 rounded-xl">
                  {filteredMobs.length === 0 && searchTerm && (
                    <div className="p-4 text-center text-gray-500">
                      Nenhum mob encontrado
                    </div>
                  )}

                  {filteredMobs.map(mob => {
                    const isSelected = selectedMobIds.includes(mob.id);
                    const fullMob = mobs[mob.id];
                    const dropCount = fullMob?.drops.length || 0;
                    const firstDrops = fullMob?.drops.slice(0, 3).map(d => d.eName).join(', ') || '';

                    return (
                      <button
                        key={mob.id}
                        onClick={() => handleAddMob(mob.id)}
                        disabled={isSelected}
                        className={`w-full px-5 py-4 text-left border-b border-gray-700 hover:bg-purple-900/20 hover:border-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isSelected ? 'bg-purple-900/20 border-purple-500/50' : ''
                        }`}
                      >
                        <div className="font-semibold text-white mb-1">
                          {isSelected && '✓ '}
                          {mob.name}
                        </div>
                        <div className="text-sm text-gray-400 mb-1">
                          Lv.{mob.level} • {mob.element} {fullMob?.elementLevel} • {mob.race}
                        </div>
                        <div className="text-xs text-gray-500">
                          {dropCount} drops: {firstDrops}{dropCount > 3 ? ', ...' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Side - Selected Mobs */}
              <div className="bg-gray-800/50 rounded-2xl shadow-xl p-8 border border-purple-500/30">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Mobs Selecionados ({selectedMobIds.length})
                </h2>

                {selectedMobIds.length === 0 ? (
                  <div className="h-[calc(100vh-400px)] flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                    <div className="text-center">
                      <div className="text-4xl mb-3">📋</div>
                      <div className="text-lg">Nenhum mob selecionado</div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[calc(100vh-400px)] overflow-y-auto border-2 border-gray-700 rounded-xl">
                    {selectedMobIds.map(mobId => {
                      const mob = mobs[mobId];
                      const isExpanded = expandedMobId === mobId;
                      const dropCount = mob?.drops.length || 0;

                      return (
                        <div key={mobId} className="border-b border-gray-700">
                          <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-700/50 transition-all duration-200">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-white text-lg">
                                  {mob.name}
                                </span>
                                <button
                                  onClick={() => setExpandedMobId(isExpanded ? null : mobId)}
                                  className="text-xs px-2 py-1 bg-purple-900/50 text-purple-300 rounded-full hover:bg-purple-900 transition-colors"
                                >
                                  {dropCount} drops {isExpanded ? '▼' : '▶'}
                                </button>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveMob(mobId)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-full w-8 h-8 flex items-center justify-center font-bold text-2xl transition-all duration-200"
                            >
                              ×
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="px-6 pb-4 bg-gray-900/30">
                              <div className="space-y-1">
                                {mob.drops.map((drop, idx) => {
                                  const itemInfo = items[drop.itemId];
                                  const valueSell = itemInfo?.valueSell || 0;

                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between text-sm py-2 px-3 bg-gray-800 rounded-lg"
                                    >
                                      <span className="text-gray-300 flex-1">{drop.eName}</span>
                                      <div className="flex items-center gap-3">
                                        <span className="text-gray-500 text-xs">{drop.rate.toFixed(2)}%</span>
                                        <span className="text-green-400 text-xs font-semibold">{valueSell.toLocaleString()}z</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedMobIds.length > 0 && (
                  <div className="mt-6">
                    {hasSavedSession ? (
                      <div className="flex gap-3">
                        <button
                          onClick={clearLocalStorage}
                          className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          🗑 Limpar e Começar Nova
                        </button>
                        <button
                          onClick={() => setSessionActive(true)}
                          className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          ↩ Voltar para Sessão
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleStartSession}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        🚀 Iniciar Sessão de Farm
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {reportData && (
        <ReportModal
          report={reportData}
          onClose={handleCloseReport}
          onExportCSV={handleExportCSV}
          onCopyToClipboard={handleCopyToClipboard}
        />
      )}
    </>
  );
}

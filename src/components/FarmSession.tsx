import { useState } from 'react';
import type { Mob, Item } from '../types';

interface FarmSessionProps {
  selectedMobIds: number[];
  mobs: Record<string, Mob>;
  items: Record<string, Item>;
  onBack: () => void;
  onShowReport: () => void;
  // Timer states
  timerStatus: 'idle' | 'running' | 'paused' | 'finished';
  timerStartTime: number | null;
  timerElapsed: number;
  timerPausedTotal: number;
  // Timer functions
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onFinishTimer: () => void;
  // Drop tracking
  dropQuantities: Record<number, number>;
  customPrices: Record<number, number>;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onUpdateCustomPrice: (itemId: number, price: number | undefined) => void;
  // Current time for timer display
  currentTime: number;
}

export function FarmSession({
  selectedMobIds,
  mobs,
  items,
  onBack,
  onShowReport,
  timerStatus,
  timerStartTime,
  timerElapsed,
  timerPausedTotal,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onFinishTimer,
  dropQuantities,
  customPrices,
  onUpdateQuantity,
  onUpdateCustomPrice,
  currentTime
}: FarmSessionProps) {

  // Sorting
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Aggregate all drops from selected mobs
  const allDrops = selectedMobIds.flatMap(mobId => {
    const mob = mobs[mobId];
    return mob?.drops || [];
  });

  // Remove duplicates and combine by itemId
  const uniqueDrops = Array.from(
    new Map(allDrops.map(drop => [drop.itemId, drop])).values()
  );

  // Sorting function
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort drops
  const sortedDrops = [...uniqueDrops].sort((a, b) => {
    if (!sortColumn) return 0;

    let aVal: any, bVal: any;

    switch (sortColumn) {
      case 'item':
        aVal = a.eName.toLowerCase();
        bVal = b.eName.toLowerCase();
        break;
      case 'dropRate':
        aVal = a.rate;
        bVal = b.rate;
        break;
      case 'npc':
        aVal = items[a.itemId]?.valueSell || 0;
        bVal = items[b.itemId]?.valueSell || 0;
        break;
      case 'custom':
        aVal = customPrices[a.itemId] || items[a.itemId]?.valueSell || 0;
        bVal = customPrices[b.itemId] || items[b.itemId]?.valueSell || 0;
        break;
      case 'quantity':
        aVal = dropQuantities[a.itemId] || 0;
        bVal = dropQuantities[b.itemId] || 0;
        break;
      case 'total':
        const aPrice = customPrices[a.itemId] ?? (items[a.itemId]?.valueSell || 0);
        const bPrice = customPrices[b.itemId] ?? (items[b.itemId]?.valueSell || 0);
        aVal = (dropQuantities[a.itemId] || 0) * aPrice;
        bVal = (dropQuantities[b.itemId] || 0) * bPrice;
        break;
      default:
        return 0;
    }

    if (typeof aVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    } else {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
  });


  // Calculate elapsed time
  const getElapsedTime = () => {
    if (!timerStartTime) return 0;
    if (timerStatus === 'running') {
      return currentTime - timerStartTime - timerPausedTotal;
    }
    return timerElapsed;
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };


  // Calculate profits
  const calculateProfit = () => {
    let totalProfit = 0;
    const itemBreakdown: Array<{ item: string; quantity: number; value: number; total: number }> = [];

    uniqueDrops.forEach(drop => {
      const quantity = dropQuantities[drop.itemId] || 0;
      if (quantity === 0) return;

      const itemInfo = items[drop.itemId];
      const npcValue = itemInfo?.valueSell || 0;
      const customValue = customPrices[drop.itemId];
      const value = customValue !== undefined ? customValue : npcValue;
      const total = quantity * value;

      totalProfit += total;
      itemBreakdown.push({
        item: drop.eName,
        quantity,
        value,
        total
      });
    });

    const elapsed = getElapsedTime();
    const hours = elapsed / (1000 * 60 * 60);
    const profitPerHour = hours > 0 ? totalProfit / hours : totalProfit;

    return { totalProfit, profitPerHour, itemBreakdown, elapsed };
  };

  const { totalProfit, profitPerHour, elapsed } = calculateProfit();

  return (
    <div className="h-screen max-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto px-16 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="mb-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Sessão de Farm
          </h1>
        </header>

        <div className="grid grid-cols-3 gap-6 mb-4">
          {/* Timer Card */}
          <div className="col-span-2 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
            <div className="text-center mb-3">
              <div className="text-4xl font-bold text-blue-600 font-mono mb-3">
                {formatTime(getElapsedTime())}
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
                {selectedMobIds.map(mobId => (
                  <span key={mobId} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {mobs[mobId].name}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2">
                {timerStatus === 'idle' && (
                  <button
                    onClick={onStartTimer}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    ▶ Iniciar
                  </button>
                )}
                {timerStatus === 'running' && (
                  <>
                    <button
                      onClick={onPauseTimer}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                      ⏸ Pausar
                    </button>
                    <button
                      onClick={onFinishTimer}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                      ⏹ Finalizar
                    </button>
                  </>
                )}
                {timerStatus === 'paused' && (
                  <>
                    <button
                      onClick={onResumeTimer}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                      ▶ Retomar
                    </button>
                    <button
                      onClick={onFinishTimer}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                      ⏹ Finalizar
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Back Button and Report Button */}
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
              {timerStatus === 'finished' && (
                <button
                  onClick={onShowReport}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  📊 Visualizar Relatório
                </button>
              )}
              <button
                onClick={onBack}
                disabled={timerStatus === 'running'}
                className="w-full py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Voltar para Seleção
              </button>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
            <h3 className="text-base font-bold text-gray-800 mb-3">Resumo</h3>
            <div className="space-y-2">
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-xs text-green-700">Lucro Total</div>
                <div className="text-xl font-bold text-green-900">
                  {totalProfit.toLocaleString()}z
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-xs text-blue-700">Lucro/Hora</div>
                <div className="text-xl font-bold text-blue-900">
                  {profitPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}z/h
                </div>
              </div>
              {elapsed < 3600000 && elapsed > 0 && (
                <div className="text-xs text-gray-500 italic">
                  * Projeção
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drops Table */}
        <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100 flex-1 flex flex-col min-h-0">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Tracking de Drops</h3>
          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b-2 border-gray-200">
                  <th
                    onClick={() => handleSort('item')}
                    className="text-left py-2 px-3 font-semibold text-gray-700 text-sm cursor-pointer hover:bg-gray-100 select-none"
                  >
                    Item {sortColumn === 'item' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('dropRate')}
                    className="text-right py-2 px-3 font-semibold text-gray-700 text-sm cursor-pointer hover:bg-gray-100 select-none"
                  >
                    Drop % {sortColumn === 'dropRate' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('npc')}
                    className="text-right py-2 px-3 font-semibold text-gray-700 text-sm cursor-pointer hover:bg-gray-100 select-none"
                  >
                    Valor NPC {sortColumn === 'npc' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('custom')}
                    className="text-right py-2 px-3 font-semibold text-gray-700 text-sm cursor-pointer hover:bg-gray-100 select-none"
                  >
                    Valor Custom {sortColumn === 'custom' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('quantity')}
                    className="text-right py-2 px-3 font-semibold text-gray-700 text-sm cursor-pointer hover:bg-gray-100 select-none"
                  >
                    Quantidade {sortColumn === 'quantity' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('total')}
                    className="text-right py-2 px-3 font-semibold text-gray-700 text-sm cursor-pointer hover:bg-gray-100 select-none"
                  >
                    Total {sortColumn === 'total' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedDrops.map(drop => {
                  const itemInfo = items[drop.itemId];
                  const npcValue = itemInfo?.valueSell || 0;
                  const customValue = customPrices[drop.itemId];
                  const quantity = dropQuantities[drop.itemId] || 0;
                  const value = customValue !== undefined ? customValue : npcValue;
                  const total = quantity * value;

                  return (
                    <tr key={drop.itemId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium text-gray-900 text-sm">{drop.eName}</td>
                      <td className="py-2 px-3 text-right text-gray-600 text-sm">{drop.rate.toFixed(2)}%</td>
                      <td className="py-2 px-3 text-right text-gray-600 text-sm">{npcValue.toLocaleString()}z</td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          placeholder={npcValue.toString()}
                          value={customValue ?? ''}
                          onChange={(e) => onUpdateCustomPrice(drop.itemId, e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-right text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={quantity}
                          onChange={(e) => onUpdateQuantity(drop.itemId, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-right text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900 text-sm">{total.toLocaleString()}z</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

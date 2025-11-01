import { useState } from 'react';
import type { SessionMob, Mob, Item } from '../types';

interface DropTrackerProps {
  sessionMobs: SessionMob[];
  mobsData: Record<string, Mob>;
  itemsData: Record<string, Item>;
  onUpdateDrop: (mobId: number, itemId: number, quantity: number) => void;
  onUpdateCustomPrice: (mobId: number, itemId: number, price: number | undefined) => void;
  disabled?: boolean;
}

export function DropTracker({
  sessionMobs,
  mobsData,
  onUpdateDrop,
  onUpdateCustomPrice,
  disabled = false
}: DropTrackerProps) {
  const [expandedMobs, setExpandedMobs] = useState<Set<number>>(new Set());

  const toggleMob = (mobId: number) => {
    const newExpanded = new Set(expandedMobs);
    if (newExpanded.has(mobId)) {
      newExpanded.delete(mobId);
    } else {
      newExpanded.add(mobId);
    }
    setExpandedMobs(newExpanded);
  };

  if (sessionMobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Tracking de Drops</h2>
        <p className="text-gray-500 text-center py-8">
          Selecione mobs para começar a trackear drops
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Tracking de Drops</h2>

      <div className="space-y-3">
        {sessionMobs.map(sessionMob => {
          const mob = mobsData[sessionMob.mobId];
          const isExpanded = expandedMobs.has(sessionMob.mobId);
          const totalDropped = sessionMob.drops.reduce((sum, d) => sum + d.quantity, 0);

          return (
            <div key={sessionMob.mobId} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleMob(sessionMob.mobId)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{isExpanded ? '▼' : '▶'}</span>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{mob?.name}</div>
                    <div className="text-sm text-gray-600">
                      {sessionMob.drops.length} tipos de drops • {totalDropped} itens totais
                    </div>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-2 font-semibold text-gray-700">Item</th>
                          <th className="text-right py-2 px-2 font-semibold text-gray-700">Taxa Drop</th>
                          <th className="text-right py-2 px-2 font-semibold text-gray-700">Qtd.</th>
                          <th className="text-right py-2 px-2 font-semibold text-gray-700">Valor NPC</th>
                          <th className="text-right py-2 px-2 font-semibold text-gray-700">Valor Custom</th>
                          <th className="text-right py-2 px-2 font-semibold text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionMob.drops.map(drop => {
                          const mobDrop = mob?.drops.find(d => d.itemId === drop.itemId);
                          const totalValue = drop.quantity * (drop.customValue ?? drop.npcValue);

                          return (
                            <tr key={drop.itemId} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-2 px-2">
                                <div className="font-medium text-gray-900">{drop.itemEName}</div>
                                <div className="text-xs text-gray-500">{drop.itemName}</div>
                              </td>
                              <td className="py-2 px-2 text-right text-gray-600">
                                {mobDrop?.rate.toFixed(2)}%
                              </td>
                              <td className="py-2 px-2 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  value={drop.quantity}
                                  onChange={(e) => onUpdateDrop(sessionMob.mobId, drop.itemId, parseInt(e.target.value) || 0)}
                                  disabled={disabled}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-right disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                              </td>
                              <td className="py-2 px-2 text-right text-gray-600">
                                {drop.npcValue.toLocaleString()}z
                              </td>
                              <td className="py-2 px-2 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  placeholder={drop.npcValue.toString()}
                                  value={drop.customValue ?? ''}
                                  onChange={(e) => onUpdateCustomPrice(
                                    sessionMob.mobId,
                                    drop.itemId,
                                    e.target.value ? parseInt(e.target.value) : undefined
                                  )}
                                  disabled={disabled}
                                  className="w-24 px-2 py-1 border border-gray-300 rounded text-right disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                              </td>
                              <td className="py-2 px-2 text-right font-semibold text-gray-900">
                                {totalValue.toLocaleString()}z
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

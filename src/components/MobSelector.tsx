import { useState, useMemo } from 'react';
import type { MobIndex, Mob } from '../types';

interface MobSelectorProps {
  mobsIndex: MobIndex[];
  mobsData: Record<string, Mob>;
  selectedMobIds: number[];
  onToggleMob: (mobId: number) => void;
  disabled?: boolean;
}

export function MobSelector({
  mobsIndex,
  mobsData,
  selectedMobIds,
  onToggleMob,
  disabled = false
}: MobSelectorProps) {
  const [search, setSearch] = useState('');

  const filteredMobs = useMemo(() => {
    const searchLower = search.toLowerCase();
    return mobsIndex.filter(mob =>
      mob.name.toLowerCase().includes(searchLower) ||
      mob.jName.toLowerCase().includes(searchLower) ||
      mob.id.toString().includes(searchLower)
    ).slice(0, 50); // Limit results for performance
  }, [mobsIndex, search]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Selecionar Mobs</h2>

      <input
        type="text"
        placeholder="Buscar mob por nome ou ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />

      {selectedMobIds.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Mobs Selecionados ({selectedMobIds.length})</h3>
          <div className="flex flex-wrap gap-2">
            {selectedMobIds.map(mobId => {
              const mob = mobsData[mobId];
              return (
                <button
                  key={mobId}
                  onClick={() => !disabled && onToggleMob(mobId)}
                  disabled={disabled}
                  className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {mob?.name} (Lv.{mob?.level})
                  {!disabled && <span className="ml-1">×</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
        {filteredMobs.length === 0 && search && (
          <div className="p-4 text-center text-gray-500">
            Nenhum mob encontrado para "{search}"
          </div>
        )}

        {filteredMobs.map(mob => {
          const isSelected = selectedMobIds.includes(mob.id);
          const fullMob = mobsData[mob.id];

          return (
            <button
              key={mob.id}
              onClick={() => !disabled && onToggleMob(mob.id)}
              disabled={disabled}
              className={`w-full px-4 py-3 text-left border-b border-gray-200 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed ${
                isSelected ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    {isSelected && '✓ '}
                    {mob.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Lv.{mob.level} • {mob.element} • {mob.race} • {fullMob?.drops.length || 0} drops
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  ID: {mob.id}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { msToHours } from '../utils/time';
import type { SessionMob } from '../types';

interface ProfitSummaryProps {
  sessionMobs: SessionMob[];
  totalTime: number;
  pausedTime: number;
}

export function ProfitSummary({ sessionMobs, totalTime, pausedTime }: ProfitSummaryProps) {
  const activeTime = totalTime - pausedTime;

  const totalProfit = sessionMobs.reduce((sum, mob) => {
    return sum + mob.drops.reduce((mobSum, drop) => {
      return mobSum + (drop.quantity * (drop.customValue ?? drop.npcValue));
    }, 0);
  }, 0);

  const profitPerHour = activeTime > 0 ? totalProfit / msToHours(activeTime) : 0;

  const totalItems = sessionMobs.reduce((sum, mob) => {
    return sum + mob.drops.reduce((mobSum, drop) => mobSum + drop.quantity, 0);
  }, 0);

  const npcProfit = sessionMobs.reduce((sum, mob) => {
    return sum + mob.drops.reduce((mobSum, drop) => {
      return mobSum + (drop.quantity * drop.npcValue);
    }, 0);
  }, 0);

  const customProfit = sessionMobs.reduce((sum, mob) => {
    return sum + mob.drops.reduce((mobSum, drop) => {
      if (drop.customValue) {
        return mobSum + (drop.quantity * drop.customValue);
      }
      return mobSum;
    }, 0);
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Resumo de Lucro</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="text-sm font-medium text-green-700 mb-1">Lucro Total</div>
          <div className="text-3xl font-bold text-green-900">
            {totalProfit.toLocaleString()}z
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="text-sm font-medium text-blue-700 mb-1">Lucro por Hora</div>
          <div className="text-3xl font-bold text-blue-900">
            {profitPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}z/h
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="text-sm font-medium text-purple-700 mb-1">Total de Itens</div>
          <div className="text-3xl font-bold text-purple-900">
            {totalItems.toLocaleString()}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="text-sm font-medium text-orange-700 mb-1">Mobs Selecionados</div>
          <div className="text-3xl font-bold text-orange-900">
            {sessionMobs.length}
          </div>
        </div>
      </div>

      {customProfit > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Lucro NPC:</span>
            <span className="font-semibold text-gray-800">{npcProfit.toLocaleString()}z</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-600">Lucro com Preços Customizados:</span>
            <span className="font-semibold text-gray-800">{totalProfit.toLocaleString()}z</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-600">Diferença:</span>
            <span className={`font-semibold ${totalProfit > npcProfit ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfit > npcProfit ? '+' : ''}{(totalProfit - npcProfit).toLocaleString()}z
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

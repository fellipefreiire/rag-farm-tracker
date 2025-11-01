import type { ComparisonReport } from '../types/comparison';

interface ComparisonDashboardProps {
  reports: ComparisonReport[];
}

export function ComparisonDashboard({ reports }: ComparisonDashboardProps) {
  // Sort reports by profit per hour (best to worst)
  const sortedByProfitPerHour = [...reports].sort((a, b) => b.profitPerHour - a.profitPerHour);

  // Sort by total profit
  const sortedByTotalProfit = [...reports].sort((a, b) => b.totalProfit - a.totalProfit);

  // Sort by duration (shortest to longest)
  const sortedByDuration = [...reports].sort((a, b) => a.sessionDuration - b.sessionDuration);

  return (
    <div className="space-y-6">
      {/* Ranking de Lucro por Hora */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🏆</span>
          Ranking: Lucro por Hora (Eficiência)
        </h3>
        <div className="space-y-3">
          {sortedByProfitPerHour.map((report, index) => (
            <div
              key={report.id}
              className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                index === 0
                  ? 'bg-yellow-50 border-yellow-400'
                  : index === 1
                  ? 'bg-gray-50 border-gray-300'
                  : index === 2
                  ? 'bg-orange-50 border-orange-300'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`text-2xl font-bold ${
                    index === 0
                      ? 'text-yellow-600'
                      : index === 1
                      ? 'text-gray-600'
                      : index === 2
                      ? 'text-orange-600'
                      : 'text-gray-400'
                  }`}
                >
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{report.label}</div>
                  <div className="text-sm text-gray-600">{report.sessionDurationFormatted}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {report.profitPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}z/h
                </div>
                <div className="text-sm text-gray-600">
                  {report.totalProfit.toLocaleString()}z total
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-3 gap-6">
        {/* Melhor Lucro Total */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
          <div className="text-4xl mb-3">💰</div>
          <div className="text-sm text-green-700 mb-1">Maior Lucro Total</div>
          <div className="text-2xl font-bold text-green-900 mb-2">
            {sortedByTotalProfit[0].totalProfit.toLocaleString()}z
          </div>
          <div className="text-sm text-green-700 font-semibold">
            {sortedByTotalProfit[0].label}
          </div>
        </div>

        {/* Melhor Eficiência */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
          <div className="text-4xl mb-3">⚡</div>
          <div className="text-sm text-blue-700 mb-1">Melhor Eficiência</div>
          <div className="text-2xl font-bold text-blue-900 mb-2">
            {sortedByProfitPerHour[0].profitPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}z/h
          </div>
          <div className="text-sm text-blue-700 font-semibold">
            {sortedByProfitPerHour[0].label}
          </div>
        </div>

        {/* Sessão Mais Rápida */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
          <div className="text-4xl mb-3">⏱</div>
          <div className="text-sm text-orange-700 mb-1">Sessão Mais Rápida</div>
          <div className="text-2xl font-bold text-orange-900 mb-2">
            {sortedByDuration[0].sessionDurationFormatted}
          </div>
          <div className="text-sm text-orange-700 font-semibold">
            {sortedByDuration[0].label}
          </div>
        </div>
      </div>

      {/* Items Mais Lucrativos de Cada Sessão */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>💎</span>
          Item Mais Lucrativo de Cada Sessão
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200"
            >
              <div className="font-bold text-purple-900 mb-2">{report.label}</div>
              {report.mostProfitableItem ? (
                <>
                  <div className="text-lg font-semibold text-gray-900">
                    {report.mostProfitableItem.itemName}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-purple-700">
                      {report.mostProfitableItem.percentOfTotal.toFixed(1)}% do lucro
                    </div>
                    <div className="text-lg font-bold text-green-700">
                      {report.mostProfitableItem.totalProfit.toLocaleString()}z
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">Nenhum item</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resumo Comparativo */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">📊 Resumo Comparativo</h3>
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sessão</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Duração</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Lucro Total</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Lucro/Hora</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{report.label}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{report.sessionDurationFormatted}</td>
                  <td className="py-3 px-4 text-right text-green-700 font-bold">
                    {report.totalProfit.toLocaleString()}z
                  </td>
                  <td className="py-3 px-4 text-right text-blue-700 font-bold">
                    {report.profitPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}z/h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

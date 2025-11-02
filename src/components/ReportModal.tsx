import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportModalProps {
  report: {
    sessionDuration: number;
    sessionDurationFormatted: string;
    totalProfit: number;
    totalProfitPerHour: number;
    itemAnalysis: Array<{
      itemName: string;
      quantity: number;
      unitPrice: number;
      totalProfit: number;
      profitPerHour: number;
      dropRate: number;
      percentOfTotal: number;
      isCustomPrice: boolean;
    }>;
    mostProfitableItem: {
      itemName: string;
      totalProfit: number;
      percentOfTotal: number;
    } | null;
    selectedMobs: Array<{
      id: number;
      name: string;
    }>;
  };
  onClose: () => void;
  onExportCSV: () => void;
  onCopyToClipboard: () => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function ReportModal({ report, onClose, onExportCSV, onCopyToClipboard }: ReportModalProps) {
  const [activeTab, setActiveTab] = useState<'table' | 'charts'>('table');
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'barH'>('pie');

  // Prepare data for charts
  const chartData = report.itemAnalysis.map(item => ({
    name: item.itemName.length > 15 ? item.itemName.substring(0, 15) + '...' : item.itemName,
    fullName: item.itemName,
    value: item.totalProfit,
    profitPerHour: item.profitPerHour,
    percentage: item.percentOfTotal,
    quantity: item.quantity
  }));

  // Sort for horizontal bar (ranking)
  const rankingData = [...chartData].sort((a, b) => b.profitPerHour - a.profitPerHour);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col report-modal-content border border-green-500/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Relatório de Farm</h2>
              <p className="text-green-100">Sessão finalizada em {report.sessionDurationFormatted}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-800">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
              <div className="text-sm text-green-400 mb-1">Lucro Total</div>
              <div className="text-3xl font-bold text-green-300">
                {report.totalProfit.toLocaleString()}z
              </div>
            </div>
            <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
              <div className="text-sm text-green-400 mb-1">Lucro por Hora</div>
              <div className="text-3xl font-bold text-green-300">
                {report.totalProfitPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}z/h
              </div>
            </div>
          </div>

          {/* Most Profitable Item */}
          {report.mostProfitableItem && (
            <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30 mb-6">
              <div className="text-sm text-yellow-400 mb-1">Item Mais Lucrativo</div>
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-yellow-300">
                  {report.mostProfitableItem.itemName}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-yellow-300">
                    {report.mostProfitableItem.totalProfit.toLocaleString()}z
                  </div>
                  <div className="text-sm text-yellow-400">
                    {report.mostProfitableItem.percentOfTotal.toFixed(1)}% do lucro total
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selected Mobs */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">Mobs Caçados</h3>
            <div className="flex flex-wrap gap-2">
              {report.selectedMobs.map(mob => (
                <span key={mob.id} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">
                  {mob.name}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 border-b border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('table')}
                className={`px-4 py-2 font-semibold text-sm transition-colors border-b-2 ${
                  activeTab === 'table'
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                📊 Análise por Item
              </button>
              <button
                onClick={() => setActiveTab('charts')}
                className={`px-4 py-2 font-semibold text-sm transition-colors border-b-2 ${
                  activeTab === 'charts'
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                📈 Gráficos
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'table' ? (
            /* Item Analysis Table */
            <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-3">Análise por Item</h3>
            <div className="border-2 border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-green-300 text-sm">Item</th>
                    <th className="text-right py-3 px-4 font-semibold text-green-300 text-sm">Qtd</th>
                    <th className="text-right py-3 px-4 font-semibold text-green-300 text-sm">Preço Unit.</th>
                    <th className="text-right py-3 px-4 font-semibold text-green-300 text-sm">Lucro Total</th>
                    <th className="text-right py-3 px-4 font-semibold text-green-300 text-sm">Lucro/Hora</th>
                    <th className="text-right py-3 px-4 font-semibold text-green-300 text-sm">% do Total</th>
                    <th className="text-right py-3 px-4 font-semibold text-green-300 text-sm">Drop Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {report.itemAnalysis.map((item, idx) => (
                    <tr key={idx} className="border-t border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-4 font-medium text-white text-sm">
                        {item.itemName}
                        {item.isCustomPrice && (
                          <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                            Custom
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-300 text-sm">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-gray-300 text-sm">{item.unitPrice.toLocaleString()}z</td>
                      <td className="py-3 px-4 text-right font-bold text-green-400 text-sm">{item.totalProfit.toLocaleString()}z</td>
                      <td className="py-3 px-4 text-right text-green-300 text-sm">
                        {item.profitPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}z/h
                      </td>
                      <td className="py-3 px-4 text-right text-gray-300 text-sm font-semibold">{item.percentOfTotal.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right text-gray-400 text-sm">{item.dropRate.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          ) : (
            /* Charts Tab */
            <div className="mb-4">
              {/* Chart Type Selector */}
              <div className="mb-4 flex justify-center gap-2">
                <button
                  onClick={() => setChartType('pie')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                    chartType === 'pie'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🥧 Pizza
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                    chartType === 'bar'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  📊 Barras
                </button>
                <button
                  onClick={() => setChartType('barH')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                    chartType === 'barH'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  📈 Ranking Lucro/Hora
                </button>
              </div>

              {/* Chart Container */}
              <div className="bg-gray-900/50 rounded-xl p-6 border-2 border-gray-700">
                {chartType === 'pie' && (
                  <div>
                    <h3 className="text-center font-bold text-white mb-4">Distribuição de Lucro por Item</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => `${entry.percentage.toFixed(1)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => `${value.toLocaleString()}z`}
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {chartType === 'bar' && (
                  <div>
                    <h3 className="text-center font-bold text-white mb-4">Lucro Total por Item</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          formatter={(value: number) => `${value.toLocaleString()}z`}
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                        />
                        <Legend />
                        <Bar dataKey="value" fill="#10b981" name="Lucro Total" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {chartType === 'barH' && (
                  <div>
                    <h3 className="text-center font-bold text-white mb-4">Ranking de Lucro por Hora</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={rankingData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9ca3af" />
                        <YAxis dataKey="name" type="category" width={150} stroke="#9ca3af" />
                        <Tooltip
                          formatter={(value: number) => `${value.toLocaleString()}z/h`}
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                        />
                        <Legend />
                        <Bar dataKey="profitPerHour" fill="#3b82f6" name="Lucro/Hora" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-900 px-6 py-4 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {report.itemAnalysis.length} item(s) coletado(s)
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCopyToClipboard}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Copiar Relatório
            </button>
            <button
              onClick={onExportCSV}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Exportar CSV
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

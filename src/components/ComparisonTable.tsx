import type { ComparisonReport } from '../types/comparison';

interface ComparisonTableProps {
  reports: ComparisonReport[];
}

export function ComparisonTable({ reports }: ComparisonTableProps) {
  // Get all unique items across all reports
  const allItemNames = new Set<string>();
  reports.forEach(report => {
    report.items.forEach(item => allItemNames.add(item.itemName));
  });

  // Get top 10 most common items
  const itemFrequency = Array.from(allItemNames).map(itemName => {
    const count = reports.filter(r =>
      r.items.some(item => item.itemName === itemName)
    ).length;
    return { itemName, count };
  }).sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Métricas Gerais */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Métricas Gerais</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-gray-200 rounded-xl">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 border-b-2 border-gray-200">
                  Métrica
                </th>
                {reports.map((report) => (
                  <th
                    key={report.id}
                    className="text-right py-3 px-4 font-semibold text-gray-700 border-b-2 border-gray-200"
                  >
                    {report.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">Duração</td>
                {reports.map((report) => (
                  <td key={report.id} className="py-3 px-4 text-right text-gray-700">
                    {report.sessionDurationFormatted}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">Lucro Total</td>
                {reports.map((report) => (
                  <td key={report.id} className="py-3 px-4 text-right font-bold text-green-700">
                    {report.totalProfit.toLocaleString()}z
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">Lucro por Hora</td>
                {reports.map((report) => (
                  <td key={report.id} className="py-3 px-4 text-right font-bold text-blue-700">
                    {report.profitPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}z/h
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">Itens Coletados</td>
                {reports.map((report) => (
                  <td key={report.id} className="py-3 px-4 text-right text-gray-700">
                    {report.items.length} tipos
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 5 Itens por Relatório */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Top 5 Itens Mais Lucrativos</h3>
        <div className="grid grid-cols-1 gap-6">
          {reports.map((report) => {
            const topItems = [...report.items]
              .sort((a, b) => b.totalProfit - a.totalProfit)
              .slice(0, 5);

            return (
              <div key={report.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                <div className="bg-purple-100 py-3 px-4 border-b-2 border-purple-200">
                  <h4 className="font-bold text-purple-900">{report.label}</h4>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Posição</th>
                      <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Item</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-gray-700">Quantidade</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-gray-700">Lucro Total</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-gray-700">Lucro/Hora</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-gray-700">% do Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topItems.map((item, index) => (
                      <tr key={item.itemName} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-4 text-sm text-gray-700">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                        </td>
                        <td className="py-2 px-4 text-sm font-medium text-gray-900">{item.itemName}</td>
                        <td className="py-2 px-4 text-right text-sm text-gray-700">{item.quantity}</td>
                        <td className="py-2 px-4 text-right text-sm font-bold text-green-700">
                          {item.totalProfit.toLocaleString()}z
                        </td>
                        <td className="py-2 px-4 text-right text-sm text-blue-700">
                          {item.profitPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}z/h
                        </td>
                        <td className="py-2 px-4 text-right text-sm font-semibold text-gray-700">
                          {item.percentOfTotal.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparação de Itens Comuns */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Comparação de Itens Mais Comuns
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-gray-200 rounded-xl">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 border-b-2 border-gray-200">
                  Item
                </th>
                {reports.map((report) => (
                  <th
                    key={report.id}
                    className="text-right py-3 px-4 font-semibold text-gray-700 border-b-2 border-gray-200"
                  >
                    {report.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itemFrequency.map(({ itemName }) => (
                <tr key={itemName} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{itemName}</td>
                  {reports.map((report) => {
                    const item = report.items.find(i => i.itemName === itemName);
                    return (
                      <td key={report.id} className="py-3 px-4 text-right">
                        {item ? (
                          <div>
                            <div className="text-sm font-bold text-green-700">
                              {item.totalProfit.toLocaleString()}z
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.quantity}x • {item.profitPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}z/h
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

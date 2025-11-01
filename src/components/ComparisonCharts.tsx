import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { ComparisonReport } from '../types/comparison';

interface ComparisonChartsProps {
  reports: ComparisonReport[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

export function ComparisonCharts({ reports }: ComparisonChartsProps) {
  const [selectedReportForPie, setSelectedReportForPie] = useState<string>(reports[0]?.id || '');

  // Data for profit/hour comparison
  const profitPerHourData = reports.map(report => ({
    name: report.label,
    'Lucro/Hora': report.profitPerHour,
    'Lucro Total': report.totalProfit
  }));

  // Data for total profit comparison
  const totalProfitData = reports.map(report => ({
    name: report.label,
    'Lucro Total': report.totalProfit
  }));

  // Data for top items comparison
  const getTopItemsData = () => {
    // Get all unique item names
    const allItemNames = new Set<string>();
    reports.forEach(report => {
      report.items.slice(0, 5).forEach(item => allItemNames.add(item.itemName));
    });

    // Create data for grouped bar chart
    return Array.from(allItemNames).slice(0, 5).map(itemName => {
      const data: any = { item: itemName };
      reports.forEach(report => {
        const item = report.items.find(i => i.itemName === itemName);
        data[report.label] = item ? item.totalProfit : 0;
      });
      return data;
    });
  };

  const topItemsData = getTopItemsData();

  // Pie chart data for selected report
  const selectedReport = reports.find(r => r.id === selectedReportForPie);
  const pieData = selectedReport
    ? selectedReport.items.slice(0, 8).map(item => ({
        name: item.itemName,
        value: item.totalProfit
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Lucro por Hora - Bar Chart */}
      <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Comparação: Lucro por Hora
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={profitPerHourData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip
              formatter={(value: number) => `${value.toLocaleString()}z/h`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="Lucro/Hora" fill="#3b82f6" name="Lucro por Hora" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lucro Total - Bar Chart */}
      <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Comparação: Lucro Total
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={totalProfitData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip
              formatter={(value: number) => `${value.toLocaleString()}z`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="Lucro Total" fill="#10b981" name="Lucro Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Items Comparison - Grouped Bar Chart */}
      {topItemsData.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Comparação: Top 5 Itens Entre Sessões
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topItemsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="item" angle={-15} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString()}z`}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
              />
              <Legend />
              {reports.map((report, index) => (
                <Bar
                  key={report.id}
                  dataKey={report.label}
                  fill={COLORS[index % COLORS.length]}
                  name={report.label}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pie Chart - Item Distribution per Report */}
      <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Distribuição de Lucro por Item
        </h3>

        {/* Report Selector */}
        <div className="mb-4 flex justify-center gap-2">
          {reports.map(report => (
            <button
              key={report.id}
              onClick={() => setSelectedReportForPie(report.id)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                selectedReportForPie === report.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {report.label}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry: any) => `${entry.name}: ${entry.percent?.toFixed(1) || 0}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${value.toLocaleString()}z`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Session Duration Comparison */}
      <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Comparação: Duração das Sessões
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={reports.map(report => ({
              name: report.label,
              'Duração (minutos)': Math.round(report.sessionDuration / 60000)
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip
              formatter={(value: number) => `${value} minutos`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="Duração (minutos)" fill="#f59e0b" name="Duração (minutos)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

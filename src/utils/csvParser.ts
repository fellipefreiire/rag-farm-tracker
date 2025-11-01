import type { ComparisonReport } from '../types/comparison';

export function parseCSV(csvContent: string, filename: string): ComparisonReport | null {
  try {
    const lines = csvContent.trim().split('\n');

    if (lines.length < 2) {
      throw new Error('CSV vazio ou inválido');
    }

    // Parse item data (linhas antes da linha vazia)
    const items: ComparisonReport['items'] = [];
    let i = 1; // Skip header

    while (i < lines.length && lines[i].trim() !== '') {
      const line = lines[i].trim();

      // Parse CSV line (handle quoted values)
      const matches = line.match(/("([^"]*)"|[^,]+)/g);
      if (!matches || matches.length < 7) {
        i++;
        continue;
      }

      const [itemName, quantity, unitPrice, totalProfit, profitPerHour, percentOfTotal, dropRate] = matches.map(v =>
        v.replace(/^"|"$/g, '') // Remove quotes
      );

      items.push({
        itemName,
        quantity: parseInt(quantity),
        unitPrice: parseInt(unitPrice),
        totalProfit: parseInt(totalProfit),
        profitPerHour: parseFloat(profitPerHour),
        percentOfTotal: parseFloat(percentOfTotal.replace('%', '')),
        dropRate: parseFloat(dropRate.replace('%', ''))
      });

      i++;
    }

    // Parse summary (after empty line)
    i++; // Skip empty line
    let totalProfit = 0;
    let profitPerHour = 0;
    let sessionDurationFormatted = '';

    while (i < lines.length) {
      const line = lines[i].trim();
      if (line.startsWith('Lucro Total,')) {
        totalProfit = parseInt(line.split(',')[1]);
      } else if (line.startsWith('Lucro por Hora,')) {
        profitPerHour = parseFloat(line.split(',')[1]);
      } else if (line.startsWith('Duração,') || line.startsWith('Dura\u00e7\u00e3o,')) {
        sessionDurationFormatted = line.split(',')[1];
      }
      i++;
    }

    // Calculate session duration in milliseconds
    const [hours, minutes, seconds] = sessionDurationFormatted.split(':').map(v => parseInt(v));
    const sessionDuration = (hours * 3600 + minutes * 60 + seconds) * 1000;

    // Find most profitable item
    const mostProfitableItem = items.length > 0
      ? items.reduce((max, item) => item.totalProfit > max.totalProfit ? item : max)
      : null;

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      filename,
      label: filename.replace('.csv', '').replace('farm-report-', 'Sessão '),
      uploadDate: new Date(),
      totalProfit,
      profitPerHour,
      sessionDuration,
      sessionDurationFormatted,
      items,
      mostProfitableItem: mostProfitableItem ? {
        itemName: mostProfitableItem.itemName,
        totalProfit: mostProfitableItem.totalProfit,
        percentOfTotal: mostProfitableItem.percentOfTotal
      } : null
    };
  } catch (error) {
    console.error('Erro ao parsear CSV:', error);
    return null;
  }
}

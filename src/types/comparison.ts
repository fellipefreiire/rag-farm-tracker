export interface ComparisonReport {
  id: string;
  filename: string;
  label: string;
  uploadDate: Date;

  // Métricas principais
  totalProfit: number;
  profitPerHour: number;
  sessionDuration: number;
  sessionDurationFormatted: string;

  // Análise por item
  items: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalProfit: number;
    profitPerHour: number;
    percentOfTotal: number;
    dropRate: number;
  }>;

  // Item mais lucrativo
  mostProfitableItem: {
    itemName: string;
    totalProfit: number;
    percentOfTotal: number;
  } | null;
}

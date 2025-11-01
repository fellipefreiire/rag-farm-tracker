import type { Session } from '../types';

export function exportToJSON(sessions: Session[]): void {
  const data = JSON.stringify({ sessions, exportDate: new Date().toISOString() }, null, 2);
  downloadFile(data, `rag-farm-export-${Date.now()}.json`, 'application/json');
}

export function exportToCSV(sessions: Session[]): void {
  const headers = [
    'ID Sessão',
    'Nome',
    'Status',
    'Data Início',
    'Data Fim',
    'Tempo Total (min)',
    'Tempo Pausado (min)',
    'Tempo Ativo (min)',
    'Lucro Total',
    'Lucro/Hora',
    'Mobs',
    'Total Itens'
  ];

  const rows = sessions.map(session => {
    const activeTime = session.totalTime - session.pausedTime;
    const totalItems = session.selectedMobs.reduce((sum, mob) => {
      return sum + mob.drops.reduce((mobSum, drop) => mobSum + drop.quantity, 0);
    }, 0);

    return [
      session.id,
      session.name,
      session.status,
      new Date(session.startTime).toLocaleString('pt-BR'),
      session.endTime ? new Date(session.endTime).toLocaleString('pt-BR') : '',
      Math.floor(session.totalTime / 60000),
      Math.floor(session.pausedTime / 60000),
      Math.floor(activeTime / 60000),
      session.totalProfit,
      session.profitPerHour.toFixed(2),
      session.selectedMobs.map(m => m.mobName).join('; '),
      totalItems
    ];
  });

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csv, `rag-farm-export-${Date.now()}.csv`, 'text/csv');
}

export function exportSessionDetails(session: Session): void {
  const details: any[] = [];

  session.selectedMobs.forEach(mob => {
    mob.drops.forEach(drop => {
      if (drop.quantity > 0) {
        details.push({
          sessao: session.name,
          mob: mob.mobName,
          item: drop.itemEName,
          quantidade: drop.quantity,
          valorNPC: drop.npcValue,
          valorCustom: drop.customValue || '',
          valorTotal: drop.quantity * (drop.customValue ?? drop.npcValue)
        });
      }
    });
  });

  const headers = ['Sessão', 'Mob', 'Item', 'Quantidade', 'Valor NPC', 'Valor Custom', 'Valor Total'];
  const csv = [
    headers.join(','),
    ...details.map(row =>
      [row.sessao, row.mob, row.item, row.quantidade, row.valorNPC, row.valorCustom, row.valorTotal]
        .map(cell => `"${cell}"`)
        .join(',')
    )
  ].join('\n');

  downloadFile(csv, `sessao-${session.id}-detalhes.csv`, 'text/csv');
}

export async function importFromJSON(file: File): Promise<Session[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.sessions && Array.isArray(data.sessions)) {
          resolve(data.sessions);
        } else {
          reject(new Error('Formato de arquivo inválido'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

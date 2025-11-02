import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ElementName = 'Neutral' | 'Fire' | 'Earth' | 'Wind' | 'Water' | 'Poison' | 'Holy' | 'Shadow' | 'Ghost' | 'Corrupt';

interface ElementData {
  color: string;
  label: string;
}

const elementInfo: Record<ElementName, ElementData> = {
  'Neutral': { color: 'bg-gray-500', label: 'Neutro' },
  'Fire': { color: 'bg-red-500', label: 'Fogo' },
  'Earth': { color: 'bg-yellow-700', label: 'Terra' },
  'Wind': { color: 'bg-green-500', label: 'Vento' },
  'Water': { color: 'bg-blue-500', label: 'Água' },
  'Poison': { color: 'bg-purple-500', label: 'Veneno' },
  'Holy': { color: 'bg-yellow-300', label: 'Sagrado' },
  'Shadow': { color: 'bg-purple-900', label: 'Sombrio' },
  'Ghost': { color: 'bg-indigo-400', label: 'Fantasma' },
  'Corrupt': { color: 'bg-pink-600', label: 'Corrupto' }
};

const elements: ElementName[] = ['Neutral', 'Fire', 'Earth', 'Wind', 'Water', 'Poison', 'Holy', 'Shadow', 'Ghost', 'Corrupt'];

// Tabelas por nível do elemento defensor
const elementTables: Record<number, Record<ElementName, Record<ElementName, number>>> = {
  1: {
    'Neutral': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 100, 'Holy': 100, 'Shadow': 100, 'Ghost': 75, 'Corrupt': 100 },
    'Fire': { 'Neutral': 100, 'Fire': 25, 'Earth': 125, 'Wind': 100, 'Water': 90, 'Poison': 120, 'Holy': 90, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Earth': { 'Neutral': 100, 'Fire': 90, 'Earth': 25, 'Wind': 125, 'Water': 100, 'Poison': 120, 'Holy': 90, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Wind': { 'Neutral': 100, 'Fire': 100, 'Earth': 90, 'Wind': 25, 'Water': 125, 'Poison': 120, 'Holy': 90, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Water': { 'Neutral': 100, 'Fire': 125, 'Earth': 100, 'Wind': 90, 'Water': 25, 'Poison': 120, 'Holy': 90, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Poison': { 'Neutral': 100, 'Fire': 120, 'Earth': 120, 'Wind': 120, 'Water': 120, 'Poison': 25, 'Holy': 90, 'Shadow': 90, 'Ghost': 90, 'Corrupt': 90 },
    'Holy': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 90, 'Holy': 25, 'Shadow': 125, 'Ghost': 100, 'Corrupt': 125 },
    'Shadow': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 90, 'Holy': 125, 'Shadow': 25, 'Ghost': 100, 'Corrupt': 90 },
    'Ghost': { 'Neutral': 75, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 90, 'Holy': 90, 'Shadow': 90, 'Ghost': 125, 'Corrupt': 125 },
    'Corrupt': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 90, 'Holy': 125, 'Shadow': 90, 'Ghost': 125, 'Corrupt': 25 }
  },
  2: {
    'Neutral': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 100, 'Holy': 100, 'Shadow': 100, 'Ghost': 50, 'Corrupt': 100 },
    'Fire': { 'Neutral': 100, 'Fire': 0, 'Earth': 150, 'Wind': 100, 'Water': 80, 'Poison': 130, 'Holy': 80, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Earth': { 'Neutral': 100, 'Fire': 80, 'Earth': 0, 'Wind': 150, 'Water': 100, 'Poison': 130, 'Holy': 80, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Wind': { 'Neutral': 100, 'Fire': 100, 'Earth': 80, 'Wind': 0, 'Water': 150, 'Poison': 130, 'Holy': 80, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Water': { 'Neutral': 100, 'Fire': 150, 'Earth': 100, 'Wind': 80, 'Water': 0, 'Poison': 130, 'Holy': 80, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Poison': { 'Neutral': 100, 'Fire': 130, 'Earth': 130, 'Wind': 130, 'Water': 130, 'Poison': 0, 'Holy': 80, 'Shadow': 80, 'Ghost': 80, 'Corrupt': 80 },
    'Holy': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 80, 'Holy': 0, 'Shadow': 150, 'Ghost': 100, 'Corrupt': 150 },
    'Shadow': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 80, 'Holy': 150, 'Shadow': 0, 'Ghost': 100, 'Corrupt': 80 },
    'Ghost': { 'Neutral': 50, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 80, 'Holy': 80, 'Shadow': 80, 'Ghost': 150, 'Corrupt': 150 },
    'Corrupt': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 80, 'Holy': 150, 'Shadow': 80, 'Ghost': 150, 'Corrupt': 0 }
  },
  3: {
    'Neutral': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 100, 'Holy': 100, 'Shadow': 100, 'Ghost': 25, 'Corrupt': 100 },
    'Fire': { 'Neutral': 100, 'Fire': 0, 'Earth': 175, 'Wind': 100, 'Water': 70, 'Poison': 140, 'Holy': 70, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Earth': { 'Neutral': 100, 'Fire': 70, 'Earth': 0, 'Wind': 175, 'Water': 100, 'Poison': 140, 'Holy': 70, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Wind': { 'Neutral': 100, 'Fire': 100, 'Earth': 70, 'Wind': 0, 'Water': 175, 'Poison': 140, 'Holy': 70, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Water': { 'Neutral': 100, 'Fire': 175, 'Earth': 100, 'Wind': 70, 'Water': 0, 'Poison': 140, 'Holy': 70, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Poison': { 'Neutral': 100, 'Fire': 140, 'Earth': 140, 'Wind': 140, 'Water': 140, 'Poison': 0, 'Holy': 70, 'Shadow': 70, 'Ghost': 70, 'Corrupt': 70 },
    'Holy': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 70, 'Holy': 0, 'Shadow': 175, 'Ghost': 100, 'Corrupt': 175 },
    'Shadow': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 70, 'Holy': 175, 'Shadow': 0, 'Ghost': 100, 'Corrupt': 70 },
    'Ghost': { 'Neutral': 25, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 70, 'Holy': 70, 'Shadow': 70, 'Ghost': 175, 'Corrupt': 175 },
    'Corrupt': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 70, 'Holy': 175, 'Shadow': 70, 'Ghost': 175, 'Corrupt': 0 }
  },
  4: {
    'Neutral': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 100, 'Holy': 100, 'Shadow': 100, 'Ghost': 25, 'Corrupt': 100 },
    'Fire': { 'Neutral': 100, 'Fire': 0, 'Earth': 200, 'Wind': 100, 'Water': 60, 'Poison': 150, 'Holy': 60, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Earth': { 'Neutral': 100, 'Fire': 60, 'Earth': 0, 'Wind': 200, 'Water': 100, 'Poison': 150, 'Holy': 60, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Wind': { 'Neutral': 100, 'Fire': 100, 'Earth': 60, 'Wind': 0, 'Water': 200, 'Poison': 150, 'Holy': 60, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Water': { 'Neutral': 100, 'Fire': 200, 'Earth': 100, 'Wind': 60, 'Water': 0, 'Poison': 150, 'Holy': 60, 'Shadow': 100, 'Ghost': 100, 'Corrupt': 100 },
    'Poison': { 'Neutral': 100, 'Fire': 150, 'Earth': 150, 'Wind': 150, 'Water': 150, 'Poison': 0, 'Holy': 60, 'Shadow': 60, 'Ghost': 60, 'Corrupt': 60 },
    'Holy': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 60, 'Holy': 0, 'Shadow': 200, 'Ghost': 100, 'Corrupt': 200 },
    'Shadow': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 60, 'Holy': 200, 'Shadow': 0, 'Ghost': 100, 'Corrupt': 60 },
    'Ghost': { 'Neutral': 0, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 60, 'Holy': 60, 'Shadow': 60, 'Ghost': 200, 'Corrupt': 200 },
    'Corrupt': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 60, 'Holy': 200, 'Shadow': 60, 'Ghost': 200, 'Corrupt': 0 }
  }
};

const getMultiplierColor = (value: number): string => {
  if (value === 0) return 'bg-gray-800 text-gray-500';
  if (value < 50) return 'bg-red-900/50 text-red-300';
  if (value < 100) return 'bg-orange-900/50 text-orange-300';
  if (value === 100) return 'bg-gray-700 text-gray-300';
  if (value <= 150) return 'bg-green-900/50 text-green-300';
  return 'bg-blue-900/50 text-blue-300';
};

export function ElementTable() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 md:px-16 mb-4">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          ← Voltar
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-16">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-3">
            Tabela de Elementos
          </h1>
          <p className="text-lg text-gray-400">
            Multiplicadores de dano entre elementos
          </p>
        </header>

        {/* Level Selector */}
        <div className="mb-6 flex justify-center">
          <div className="bg-gray-800/50 rounded-xl p-2 border border-cyan-500/30 inline-flex gap-2">
            {[1, 2, 3, 4].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  selectedLevel === level
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Nível {level}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6 bg-gray-800/50 rounded-xl p-4 border border-cyan-500/30">
          <h3 className="text-white font-bold mb-3">Legenda:</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-800 rounded"></div>
              <span className="text-gray-300">0% (Imune)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-900/50 rounded"></div>
              <span className="text-gray-300">&lt;50% (Fraco)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-900/50 rounded"></div>
              <span className="text-gray-300">50-99% (Reduzido)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-700 rounded"></div>
              <span className="text-gray-300">100% (Normal)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-900/50 rounded"></div>
              <span className="text-gray-300">101-150% (Efetivo)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-900/50 rounded"></div>
              <span className="text-gray-300">&gt;150% (Muito Efetivo)</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="bg-gray-800/50 rounded-2xl shadow-xl border border-cyan-500/30 p-4">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-left text-cyan-300 font-bold border-b-2 border-cyan-500/30 bg-gray-900/50">
                    <div className="text-xs text-gray-400 mb-1">Defensor →</div>
                    <div className="text-xs text-gray-400">↓ Atacante</div>
                  </th>
                  {elements.map((element) => (
                    <th key={element} className="p-3 text-center border-b-2 border-cyan-500/30 bg-gray-900/50">
                      <div className={`w-6 h-6 ${elementInfo[element].color} rounded mx-auto mb-1`}></div>
                      <div className="text-white font-bold text-sm">{elementInfo[element].label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {elements.map((attacker) => (
                  <tr key={attacker} className="border-b border-gray-700 hover:bg-gray-700/30">
                    <td className="p-3 border-r-2 border-cyan-500/30 bg-gray-900/30">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 ${elementInfo[attacker].color} rounded`}></div>
                        <span className="text-white font-bold text-sm">{elementInfo[attacker].label}</span>
                      </div>
                    </td>
                    {elements.map((defender) => {
                      const multiplier = elementTables[selectedLevel][attacker][defender];
                      return (
                        <td key={defender} className="p-2 text-center">
                          <div className={`${getMultiplierColor(multiplier)} px-2 py-1 rounded font-bold text-sm`}>
                            {multiplier}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>💡 Leia a tabela encontrando o elemento do seu ataque (linha) e o elemento do monstro (coluna)</p>
        </div>
      </div>
    </div>
  );
}

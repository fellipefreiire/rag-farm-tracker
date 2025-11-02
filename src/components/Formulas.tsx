import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SKILL_TOOLTIPS } from '../features/optimizer/data/tooltips';

export function Formulas() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Convert tooltips object to array and sort alphabetically
  const tooltipsArray = Object.entries(SKILL_TOOLTIPS).map(([key, value]) => ({
    key,
    ...value
  })).sort((a, b) => a.term.localeCompare(b.term));

  // Filter tooltips based on search term
  const filteredTooltips = tooltipsArray.filter(tooltip =>
    tooltip.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tooltip.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-16 mb-4">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          ← Voltar
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-16">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-3">
            Fórmulas e Mecânicas
          </h1>
          <p className="text-lg text-gray-400">
            Entenda os cálculos e mecânicas do Ragnarok Online
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Buscar fórmula ou mecânica..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder-gray-400"
          />
        </div>

        {/* Tooltips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTooltips.map((tooltip) => (
            <div
              key={tooltip.key}
              className="bg-gray-800/50 rounded-2xl shadow-xl p-6 border border-blue-500/30 hover:border-blue-500/50 transition-all"
            >
              {/* Term Header */}
              <h2 className="text-2xl font-bold text-blue-300 mb-4">
                {tooltip.term}
              </h2>

              {/* Description */}
              <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                {tooltip.description}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredTooltips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              Nenhuma fórmula encontrada para "{searchTerm}"
            </p>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-8 text-center text-gray-400">
          Mostrando {filteredTooltips.length} de {tooltipsArray.length} fórmulas
        </div>
      </div>
    </div>
  );
}

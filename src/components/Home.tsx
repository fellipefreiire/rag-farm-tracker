import { useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="pt-8 pb-12 text-center">
        <h1 className="text-5xl font-bold text-white mb-3">
          RAG Farm Tracker
        </h1>
        <p className="text-gray-400 text-lg">
          Otimize seu farming no Ragnarok Online
        </p>
      </div>

      {/* Cards Container */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* First Row - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Farm Optimizer Card */}
          <div
            onClick={() => navigate('/optimizer')}
            className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 backdrop-blur-sm rounded-2xl border border-orange-500/30 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center mb-6">
                <span className="text-4xl">🎯</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-white">
                Otimizar Farm
              </h2>

              {/* Beta Badge */}
              <span className="inline-block mt-2 px-3 py-1 bg-orange-500/20 text-orange-300 text-xs font-bold rounded-full">
                BETA
              </span>
            </div>
          </div>

          {/* Character Builder Card */}
          <div
            onClick={() => navigate('/planner')}
            className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-2xl border border-purple-500/30 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <span className="text-4xl">⚔️</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-white">
                Character Builder
              </h2>

              {/* Beta Badge */}
              <span className="inline-block mt-2 px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full">
                BETA
              </span>
            </div>
          </div>

          {/* Farm Tracker Card */}
          <div
            onClick={() => navigate('/tracker')}
            className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm rounded-2xl border border-green-500/30 shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <span className="text-4xl">📊</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-white">
                Farm Tracker
              </h2>
            </div>
          </div>
        </div>

        {/* Second Row - 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Boss Time Tracker Card */}
          <div
            onClick={() => navigate('/boss-tracker')}
            className="bg-gradient-to-br from-red-900/40 to-red-800/40 backdrop-blur-sm rounded-2xl border border-red-500/30 shadow-2xl hover:shadow-red-500/20 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center mb-6">
                <span className="text-4xl">⏱️</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-2">
                Boss Time Tracker
              </h2>

              {/* Description */}
              <p className="text-xs text-gray-400">
                Rastrear respawn de bosses em grupo
              </p>
            </div>
          </div>

          {/* Refine Calculator Card */}
          <div
            onClick={() => navigate('/refine-calculator')}
            className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 backdrop-blur-sm rounded-2xl border border-yellow-500/30 shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-6">
                <span className="text-4xl">🎲</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-2">
                Prob. Refino
              </h2>

              {/* Description */}
              <p className="text-xs text-gray-400">
                Calcule chances de refino
              </p>
            </div>
          </div>

          {/* Formulas Card */}
          <div
            onClick={() => navigate('/formulas')}
            className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm rounded-2xl border border-blue-500/30 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <span className="text-4xl">📐</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-2">
                Fórmulas
              </h2>

              {/* Badge */}
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full">
                BETA
              </span>
            </div>
          </div>

          {/* Element Table Card */}
          <div
            onClick={() => navigate('/elements')}
            className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/40 backdrop-blur-sm rounded-2xl border border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-6">
                <span className="text-4xl">⚡</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-2">
                Tabela Elementos
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

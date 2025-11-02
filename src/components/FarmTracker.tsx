import { useNavigate } from 'react-router-dom';

export function FarmTracker() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
      >
        ← Voltar
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm rounded-2xl border border-green-500/30 shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">📊</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Farm Tracker
            </h1>
            <p className="text-gray-300 text-lg">
              Registre e analise suas sessões de farming
            </p>
          </div>

          {/* Coming Soon */}
          <div className="bg-gray-800/50 rounded-xl p-12 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              🚧 Interface sendo migrada
            </h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto leading-relaxed">
              O Farm Tracker existente está sendo integrado com a nova estrutura de navegação.
              A funcionalidade completa estará disponível em breve!
            </p>

            {/* Preview of features */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
                <div className="text-green-400 font-semibold mb-2">✓ Disponível</div>
                <div className="text-gray-300 text-sm">
                  Timer de Sessão
                  <div className="text-gray-500 text-xs mt-1">
                    Play, Pause, Stop com persistência
                  </div>
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
                <div className="text-green-400 font-semibold mb-2">✓ Disponível</div>
                <div className="text-gray-300 text-sm">
                  Tracking de Drops
                  <div className="text-gray-500 text-xs mt-1">
                    Registro manual de itens e quantidades
                  </div>
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
                <div className="text-green-400 font-semibold mb-2">✓ Disponível</div>
                <div className="text-gray-300 text-sm">
                  Cálculos Automáticos
                  <div className="text-gray-500 text-xs mt-1">
                    Profit total e profit/hora
                  </div>
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
                <div className="text-green-400 font-semibold mb-2">✓ Disponível</div>
                <div className="text-gray-300 text-sm">
                  Relatórios & Export
                  <div className="text-gray-500 text-xs mt-1">
                    CSV, clipboard, comparação
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="inline-block bg-green-900/20 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 text-sm">
                ✓ Funcionalidade completa preservada
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            Enquanto isso, use o{' '}
            <button
              onClick={() => navigate('/planner')}
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Smart Planner
            </button>
            {' '}para otimizar seus farms
          </div>
        </div>
      </div>
    </div>
  );
}

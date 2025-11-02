import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOptimizer } from '../features/optimizer/context/OptimizerContext';
import { FARM_MOBS, type MobData, type ElementName } from '../data/mobData';

type Element = 'neutral' | 'water' | 'earth' | 'fire' | 'wind' | 'poison' | 'holy' | 'shadow' | 'ghost' | 'corrupt';
type OptimizationGoal = 'zeny' | 'exp';

interface MobResult {
  mob: MobData;
  timeToKill: number;
  effectiveDps: number;
  zenyPerHour: number;
  baseExpPerHour: number;
  jobExpPerHour: number;
  efficiency: number;
}

export function FarmOptimizer() {
  const navigate = useNavigate();
  const { profiles } = useOptimizer();

  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [dps, setDps] = useState<string>('');
  const [element, setElement] = useState<Element>('neutral');
  const [optimizationGoal, setOptimizationGoal] = useState<OptimizationGoal>('zeny');
  const [results, setResults] = useState<MobResult[]>([]);

  const elements: { value: Element; label: string; color: string }[] = [
    { value: 'neutral', label: 'Neutro', color: 'text-gray-300' },
    { value: 'water', label: 'Água', color: 'text-blue-400' },
    { value: 'earth', label: 'Terra', color: 'text-yellow-600' },
    { value: 'fire', label: 'Fogo', color: 'text-red-500' },
    { value: 'wind', label: 'Vento', color: 'text-green-400' },
    { value: 'poison', label: 'Veneno', color: 'text-purple-500' },
    { value: 'holy', label: 'Sagrado', color: 'text-yellow-300' },
    { value: 'shadow', label: 'Sombrio', color: 'text-purple-800' },
    { value: 'ghost', label: 'Fantasma', color: 'text-indigo-400' },
    { value: 'corrupt', label: 'Corrupto', color: 'text-pink-600' }
  ];

  // Element table mapping
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

  // Convert element type to ElementName
  const convertElement = (elem: Element): ElementName => {
    const mapping: Record<Element, ElementName> = {
      'neutral': 'Neutral',
      'fire': 'Fire',
      'earth': 'Earth',
      'wind': 'Wind',
      'water': 'Water',
      'poison': 'Poison',
      'holy': 'Holy',
      'shadow': 'Shadow',
      'ghost': 'Ghost',
      'corrupt': 'Corrupt'
    };
    return mapping[elem];
  };

  const calculateOptimization = () => {
    const baseDps = parseFloat(dps);
    if (!baseDps || !selectedProfile) return;

    const attackerElement = convertElement(element);
    const mobResults: MobResult[] = [];

    FARM_MOBS.forEach((mob) => {
      // Get element multiplier
      const multiplier = elementTables[mob.elementLevel][attackerElement][mob.element] / 100;

      // Calculate effective DPS after element modifier
      const effectiveDps = baseDps * multiplier;

      // Time to kill in seconds
      const timeToKill = mob.hp / effectiveDps;

      // Kills per hour (3600 seconds in an hour, adding 2 second delay between kills)
      const killsPerHour = 3600 / (timeToKill + 2);

      // Calculate per hour rates
      const zenyPerHour = killsPerHour * mob.averageZenyPerKill;
      const baseExpPerHour = killsPerHour * mob.baseExp;
      const jobExpPerHour = killsPerHour * mob.jobExp;

      // Efficiency metric based on optimization goal
      const efficiency = optimizationGoal === 'zeny'
        ? zenyPerHour
        : (baseExpPerHour + jobExpPerHour) / 2;

      mobResults.push({
        mob,
        timeToKill,
        effectiveDps,
        zenyPerHour,
        baseExpPerHour,
        jobExpPerHour,
        efficiency
      });
    });

    // Sort by efficiency (highest first)
    mobResults.sort((a, b) => b.efficiency - a.efficiency);

    setResults(mobResults);
  };

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
          <div className="inline-flex items-center gap-3 mb-4">
            <h1 className="text-5xl font-bold text-white">
              Otimizador de Farm
            </h1>
            <span className="px-4 py-1 bg-orange-500/20 text-orange-300 text-sm font-bold rounded-full border border-orange-500/30">
              BETA
            </span>
          </div>
          <p className="text-lg text-gray-400">
            Encontre os melhores locais de farm baseado no seu personagem
          </p>
        </header>

        {/* Main Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 rounded-2xl shadow-xl p-8 border border-orange-500/30">
            {/* Option 1: Select Character */}
            <div className="mb-8">
              <label className="block text-white text-lg font-bold mb-3">
                1. Selecione seu Personagem
              </label>
              {profiles && profiles.length > 0 ? (
                <select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                >
                  <option value="">Selecione um personagem...</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name} - {profile.class} (Base {profile.baseLevel} / Job {profile.jobLevel})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="bg-orange-900/30 rounded-xl p-4 border border-orange-500/30">
                  <p className="text-orange-200 text-sm">
                    ⚠️ Você ainda não criou nenhum personagem. <button onClick={() => navigate('/planner')} className="underline font-bold hover:text-orange-100">Criar personagem</button>
                  </p>
                </div>
              )}
            </div>

            {/* Option 2: DPS Input */}
            <div className="mb-8">
              <label className="block text-white text-lg font-bold mb-3">
                2. DPS no Dummy (Damage por Segundo)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 15000"
                  value={dps}
                  onChange={(e) => setDps(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  DPS
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Digite o dano por segundo que você consegue fazer no dummy de treino
              </p>
            </div>

            {/* Option 3: Element Selection */}
            <div className="mb-8">
              <label className="block text-white text-lg font-bold mb-3">
                3. Elemento do Dano
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {elements.map((elem) => (
                  <button
                    key={elem.value}
                    onClick={() => setElement(elem.value)}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all border-2 ${
                      element === elem.value
                        ? 'bg-orange-500 text-white border-orange-400'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <span className={element === elem.value ? 'text-white' : elem.color}>
                      {elem.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Option 4: Optimization Goal */}
            <div className="mb-8">
              <label className="block text-white text-lg font-bold mb-3">
                4. Otimizar para
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setOptimizationGoal('zeny')}
                  className={`px-6 py-4 rounded-xl font-semibold transition-all border-2 ${
                    optimizationGoal === 'zeny'
                      ? 'bg-orange-500 text-white border-orange-400'
                      : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-1">💰</div>
                  <div>Zeny/hora</div>
                  <div className="text-xs opacity-75 mt-1">Maximizar lucro</div>
                </button>
                <button
                  onClick={() => setOptimizationGoal('exp')}
                  className={`px-6 py-4 rounded-xl font-semibold transition-all border-2 ${
                    optimizationGoal === 'exp'
                      ? 'bg-orange-500 text-white border-orange-400'
                      : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-1">⭐</div>
                  <div>XP/hora</div>
                  <div className="text-xs opacity-75 mt-1">Maximizar experiência</div>
                </button>
              </div>
            </div>

            {/* Analyze Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={calculateOptimization}
                disabled={!selectedProfile || !dps}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg text-lg"
              >
                🎯 Analisar Melhores Locais
              </button>
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-8">
              <h2 className="text-3xl font-bold text-white mb-4 text-center">
                🏆 Top {results.length} Melhores Locais
              </h2>
              <p className="text-gray-400 text-center mb-6">
                Otimizando para: <span className="text-orange-400 font-bold">
                  {optimizationGoal === 'zeny' ? 'Zeny/hora 💰' : 'XP/hora ⭐'}
                </span>
              </p>

              <div className="grid grid-cols-1 gap-4">
                {results.slice(0, 10).map((result, index) => (
                  <div
                    key={result.mob.id}
                    className={`bg-gray-800/50 rounded-xl p-6 border transition-all hover:scale-[1.02] ${
                      index === 0
                        ? 'border-yellow-500/50 shadow-yellow-500/20 shadow-lg'
                        : index === 1
                        ? 'border-gray-400/50'
                        : index === 2
                        ? 'border-orange-700/50'
                        : 'border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`text-4xl font-bold ${
                          index === 0
                            ? 'text-yellow-400'
                            : index === 1
                            ? 'text-gray-300'
                            : index === 2
                            ? 'text-orange-600'
                            : 'text-gray-500'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{result.mob.name}</h3>
                          <div className="flex gap-2 mt-1">
                            <span className="text-sm px-2 py-1 bg-gray-700 rounded text-gray-300">
                              Lvl {result.mob.level}
                            </span>
                            <span className="text-sm px-2 py-1 bg-gray-700 rounded text-gray-300">
                              {result.mob.element} {result.mob.elementLevel}
                            </span>
                            <span className="text-sm px-2 py-1 bg-gray-700 rounded text-gray-300">
                              {result.mob.race}
                            </span>
                          </div>
                        </div>
                      </div>
                      {index < 3 && (
                        <div className="text-3xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">HP</div>
                        <div className="text-lg font-bold text-white">{result.mob.hp.toLocaleString()}</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">Tempo/Kill</div>
                        <div className="text-lg font-bold text-cyan-400">{result.timeToKill.toFixed(2)}s</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">DPS Efetivo</div>
                        <div className="text-lg font-bold text-purple-400">{Math.round(result.effectiveDps).toLocaleString()}</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">Kills/Hora</div>
                        <div className="text-lg font-bold text-green-400">{Math.round(3600 / (result.timeToKill + 2)).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-orange-900/20 rounded-lg border border-orange-500/30">
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">💰 Zeny/hora</div>
                        <div className="text-xl font-bold text-yellow-400">
                          {Math.round(result.zenyPerHour).toLocaleString()}z
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">📗 Base XP/hora</div>
                        <div className="text-xl font-bold text-blue-400">
                          {Math.round(result.baseExpPerHour).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">📘 Job XP/hora</div>
                        <div className="text-xl font-bold text-green-400">
                          {Math.round(result.jobExpPerHour).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { CharacterBuilder } from '../features/optimizer/components/CharacterBuilder';
import { useOptimizer } from '../features/optimizer/context/OptimizerContext';
import type { AssassinProfile } from '../features/optimizer/types/assassin';

export function Planner() {
  const [view, setView] = useState<'list' | 'builder' | 'edit'>('list');
  const [editingProfile, setEditingProfile] = useState<AssassinProfile | null>(null);
  const { saveProfile, profiles, deleteProfile } = useOptimizer();

  const handleCreateNew = () => {
    setEditingProfile(null);
    setView('builder');
  };

  const handleEditProfile = (profile: AssassinProfile) => {
    setEditingProfile(profile);
    setView('edit');
  };

  const handleSaveProfile = (profile: AssassinProfile) => {
    saveProfile(profile);
    setView('list');
  };

  const handleCancelBuilder = () => {
    setView('list');
    setEditingProfile(null);
  };

  const handleDeleteProfile = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta build?')) {
      deleteProfile(id);
    }
  };

  const handleExportProfile = (profile: AssassinProfile) => {
    const dataStr = JSON.stringify(profile, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.name.replace(/\s+/g, '_')}_build.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportProfile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target?.result as string) as AssassinProfile;
            // Generate new ID to avoid conflicts
            imported.id = Date.now().toString();
            imported.createdAt = Date.now();
            imported.updatedAt = Date.now();
            saveProfile(imported);
            alert(`Build "${imported.name}" importada com sucesso!`);
          } catch (error) {
            alert('Erro ao importar build. Verifique se o arquivo é válido.');
            console.error('Import error:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Builder/Edit view
  if (view === 'builder' || view === 'edit') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-8">
        <button
          onClick={handleCancelBuilder}
          className="ml-4 mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          ← Voltar
        </button>
        <CharacterBuilder
          onSave={handleSaveProfile}
          onCancel={handleCancelBuilder}
          initialProfile={editingProfile}
        />
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Minhas Builds</h1>
            <p className="text-gray-400">Gerencie seus personagens e equipamentos</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleImportProfile}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Importar
            </button>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors shadow-lg"
            >
              + Nova Build
            </button>
          </div>
        </div>

        {/* Character List */}
        {profiles && profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-xl border border-purple-500/30 shadow-xl p-6 hover:border-purple-400/50 transition-all cursor-pointer"
                onClick={() => handleEditProfile(profile)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{profile.name}</h3>
                    <p className="text-purple-300 text-sm">{profile.class}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportProfile(profile);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Exportar build"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProfile(profile.id);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Excluir build"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base Level</span>
                    <span className="text-white font-mono">{profile.baseLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Job Level</span>
                    <span className="text-white font-mono">{profile.jobLevel}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-red-400 font-bold">STR</span>
                      <span className="text-white ml-1">{profile.stats.str}</span>
                    </div>
                    <div>
                      <span className="text-green-400 font-bold">AGI</span>
                      <span className="text-white ml-1">{profile.stats.agi}</span>
                    </div>
                    <div>
                      <span className="text-orange-400 font-bold">VIT</span>
                      <span className="text-white ml-1">{profile.stats.vit}</span>
                    </div>
                    <div>
                      <span className="text-blue-400 font-bold">INT</span>
                      <span className="text-white ml-1">{profile.stats.int}</span>
                    </div>
                    <div>
                      <span className="text-yellow-400 font-bold">DEX</span>
                      <span className="text-white ml-1">{profile.stats.dex}</span>
                    </div>
                    <div>
                      <span className="text-pink-400 font-bold">LUK</span>
                      <span className="text-white ml-1">{profile.stats.luk}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500 text-right">
                  Clique para editar
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-xl border border-purple-500/30 p-12 max-w-md mx-auto">
              <svg className="w-16 h-16 text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma build criada</h3>
              <p className="text-gray-400 mb-6">Comece criando sua primeira build de personagem</p>
              <button
                onClick={handleCreateNew}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors"
              >
                Criar Primeira Build
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

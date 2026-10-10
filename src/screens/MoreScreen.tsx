import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const MoreScreen: React.FC = () => {
  const {
    profile,
    updateProfile,
    activities,
    vocabulary,
    totalMinutes,
    totalHoursFormatted,
    completedPercentA2,
    clearAllData,
    loadSampleData,
  } = useApp();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [weeklyGoal, setWeeklyGoal] = useState(profile.goals?.weeklyGoalHours || 5);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const handleSaveProfile = async () => {
    await updateProfile({
      displayName,
      goals: {
        ...profile.goals,
        weeklyGoalHours: Number(weeklyGoal),
      },
    });
    setIsEditingProfile(false);
  };

  const handleExportData = () => {
    const dataToExport = {
      profile,
      activities,
      vocabulary,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-r-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pb-12 space-y-5 px-4 pt-4">
      {/* Profile Header */}
      <section className="bg-[#111726] rounded-2xl p-4 shadow-xl border border-[#1e293b] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#182236] border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] font-bold text-base">
            {profile.displayName?.slice(0, 1).toUpperCase() || 'E'}
          </div>
          <div className="flex flex-col">
            <h2 className="font-serif text-lg text-[#f1f5f9] font-bold tracking-tight">
              {profile.displayName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] bg-[#0284c7]/20 border border-[#38bdf8]/30 text-[#38bdf8] px-2 py-0.5 rounded-full font-bold uppercase">
                Nível {profile.currentLevel}
              </span>
              <span className="text-xs text-[#94a3b8]">• Meta: {profile.targetLevel}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="px-3 py-1.5 rounded-lg bg-[#182236] text-[#38bdf8] text-xs font-semibold border border-[#1e293b]"
        >
          {isEditingProfile ? 'Fechar' : 'Editar'}
        </button>
      </section>

      {/* Profile Edit Panel */}
      {isEditingProfile && (
        <section className="bg-[#111726] rounded-2xl p-4 shadow-xl border border-[#38bdf8]/30 space-y-3">
          <h3 className="font-semibold text-xs text-[#f1f5f9]">Configurações de Perfil</h3>
          <div>
            <label className="block text-[11px] font-medium text-[#94a3b8] mb-1">Nome</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-10 px-3 bg-[#182236] rounded-xl text-xs text-[#f1f5f9] border border-[#1e293b]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#94a3b8] mb-1">Meta Semanal (horas)</label>
            <input
              type="number"
              min={1}
              max={40}
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(Number(e.target.value))}
              className="w-full h-10 px-3 bg-[#182236] rounded-xl text-xs text-[#f1f5f9] border border-[#1e293b]"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            className="w-full h-10 bg-[#0284c7] text-white rounded-xl font-semibold text-xs shadow-md"
          >
            Salvar
          </button>
        </section>
      )}

      {/* Database Controls */}
      <section className="bg-[#111726] rounded-2xl p-4 shadow-xl border border-[#1e293b] space-y-3">
        <h3 className="text-xs font-bold text-[#64748b] uppercase">Dados e Backup</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleExportData}
            className="w-full h-10 px-3 rounded-xl bg-[#182236] text-xs font-semibold text-[#f1f5f9] border border-[#1e293b] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Exportar Dados (JSON)</span>
          </button>
          {showExportSuccess && (
            <p className="text-xs text-[#10b981] text-center font-semibold">Backup gerado com sucesso!</p>
          )}

          <button
            onClick={clearAllData}
            className="w-full h-10 px-3 rounded-xl bg-[#182236] hover:bg-red-500/10 text-xs font-semibold text-red-400 border border-red-500/20 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            <span>Zerar Todos os Dados do App</span>
          </button>

          <button
            onClick={loadSampleData}
            className="w-full h-10 px-3 rounded-xl bg-[#182236] text-xs font-semibold text-[#38bdf8] border border-[#38bdf8]/30 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Carregar Exemplo de Teste</span>
          </button>
        </div>
      </section>
    </div>
  );
};

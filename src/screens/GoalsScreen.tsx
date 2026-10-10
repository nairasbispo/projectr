import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const GoalsScreen: React.FC = () => {
  const {
    profile,
    updateGoals,
    todayMinutes,
    thisWeekMinutes,
    currentStreakDays,
    setFeedbackMessage,
  } = useApp();

  const [dailyMinutes, setDailyMinutes] = useState(profile.goals?.dailyGoalMinutes || 30);
  const [weeklyHours, setWeeklyHours] = useState(profile.goals?.weeklyGoalHours || 5);
  const [targetDays, setTargetDays] = useState(profile.goals?.targetDaysPerWeek || 5);
  const [isSaved, setIsSaved] = useState(false);

  // Daily calculations
  const dailyProgressPct = Math.min(100, Math.round((todayMinutes / (dailyMinutes || 1)) * 100));
  const dailyRemainingMins = Math.max(0, dailyMinutes - todayMinutes);

  // Weekly calculations
  const weeklyTargetMins = (weeklyHours || 1) * 60;
  const weeklyProgressPct = Math.min(100, Math.round((thisWeekMinutes / weeklyTargetMins) * 100));
  const weeklyStudiedHours = (thisWeekMinutes / 60).toFixed(1);
  const weeklyRemainingHours = Math.max(0, (weeklyTargetMins - thisWeekMinutes) / 60).toFixed(1);

  const handleSaveGoals = async () => {
    await updateGoals({
      dailyGoalMinutes: Number(dailyMinutes),
      weeklyGoalHours: Number(weeklyHours),
      targetDaysPerWeek: Number(targetDays),
    });
    setIsSaved(true);
    setFeedbackMessage('Metas salvas com sucesso no Firebase!');
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pb-12 space-y-5 px-4 pt-4">
      {/* Header */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#0284c7]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
            <span className="material-symbols-outlined text-[18px]">flag</span>
          </span>
          <span className="text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider">
            Compromisso & Hábitos
          </span>
        </div>
        <h1 className="font-serif text-2xl text-[#f1f5f9] font-bold tracking-tight">
          Metas de Estudo (Goals)
        </h1>
        <p className="text-xs text-[#94a3b8]">
          Defina quantas horas ou minutos você quer estudar por dia e por semana para manter sua evolução contínua.
        </p>
      </section>

      {/* Live Trackers (Today & Week) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Tracker Hoje */}
        <div className="bg-[#111726] border border-[#1e293b] rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#64748b]">Meta Hoje</span>
              <span className="material-symbols-outlined text-[#38bdf8] text-[18px]">today</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-[#f1f5f9]">{todayMinutes}</span>
              <span className="text-xs text-[#94a3b8]">/ {dailyMinutes} min</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-[#94a3b8] mb-1">
              <span>{dailyProgressPct}%</span>
              <span>{dailyRemainingMins > 0 ? `Faltam ${dailyRemainingMins}m` : 'Concluído! 🎉'}</span>
            </div>
            <div className="w-full bg-[#182236] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#38bdf8] h-full rounded-full transition-all duration-500"
                style={{ width: `${dailyProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tracker Semana */}
        <div className="bg-[#111726] border border-[#1e293b] rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#64748b]">Meta Semana</span>
              <span className="material-symbols-outlined text-[#10b981] text-[18px]">date_range</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-[#f1f5f9]">{weeklyStudiedHours}</span>
              <span className="text-xs text-[#94a3b8]">/ {weeklyHours}h</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-[#94a3b8] mb-1">
              <span>{weeklyProgressPct}%</span>
              <span>{Number(weeklyRemainingHours) > 0 ? `Faltam ${weeklyRemainingHours}h` : 'Meta batida! 🔥'}</span>
            </div>
            <div className="w-full bg-[#182236] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#10b981] h-full rounded-full transition-all duration-500"
                style={{ width: `${weeklyProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Goal Customization Form */}
      <section className="bg-[#111726] border border-[#1e293b] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">tune</span>
            <h2 className="text-sm font-semibold text-[#f1f5f9]">Ajustar Minhas Metas</h2>
          </div>
          {isSaved && (
            <span className="text-[11px] font-bold text-[#10b981] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check</span> Salvo
            </span>
          )}
        </div>

        {/* 1. Meta Diária (em minutos ou horas) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#cbd5e1]">
              Meta Diária de Prática:
            </label>
            <span className="text-sm font-bold text-[#38bdf8]">
              {dailyMinutes} minutos ({Math.floor(dailyMinutes / 60)}h {dailyMinutes % 60}m)
            </span>
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-5 gap-1.5">
            {[15, 25, 30, 45, 60].map((m) => (
              <button
                key={m}
                onClick={() => setDailyMinutes(m)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  dailyMinutes === m
                    ? 'bg-[#0284c7] text-white border-[#38bdf8]'
                    : 'bg-[#182236] text-[#94a3b8] border-[#1e293b] hover:text-white'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>

          {/* Slider for fine tuning */}
          <input
            type="range"
            min={5}
            max={180}
            step={5}
            value={dailyMinutes}
            onChange={(e) => setDailyMinutes(Number(e.target.value))}
            className="w-full accent-[#38bdf8] cursor-pointer"
          />
        </div>

        {/* 2. Meta Semanal (em horas) */}
        <div className="space-y-2 pt-2 border-t border-[#1e293b]/70">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#cbd5e1]">
              Meta Semanal Acumulada:
            </label>
            <span className="text-sm font-bold text-[#10b981]">
              {weeklyHours} horas por semana ({weeklyHours * 60} min)
            </span>
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-5 gap-1.5">
            {[2, 3, 5, 7, 10].map((h) => (
              <button
                key={h}
                onClick={() => setWeeklyHours(h)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  weeklyHours === h
                    ? 'bg-[#10b981] text-white border-[#34d399]'
                    : 'bg-[#182236] text-[#94a3b8] border-[#1e293b] hover:text-white'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>

          {/* Slider for fine tuning */}
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(Number(e.target.value))}
            className="w-full accent-[#10b981] cursor-pointer"
          />
        </div>

        {/* 3. Dias de Prática na Semana */}
        <div className="space-y-2 pt-2 border-t border-[#1e293b]/70">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#cbd5e1]">
              Frequência Alvo:
            </label>
            <span className="text-sm font-bold text-[#f59e0b]">{targetDays} dias na semana</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <button
                key={d}
                onClick={() => setTargetDays(d)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  targetDays === d
                    ? 'bg-[#f59e0b] text-black border-[#fbbf24]'
                    : 'bg-[#182236] text-[#94a3b8] border-[#1e293b] hover:text-white'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveGoals}
          className="w-full h-12 bg-gradient-to-r from-[#0284c7] to-[#2563eb] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0284c7]/20 hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>Salvar Metas no Perfil</span>
        </button>
      </section>

      {/* Habit Strategy Advice */}
      <section className="bg-[#111726] border border-[#1e293b] rounded-2xl p-4 shadow-xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[18px]">psychology</span>
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-xs font-bold text-[#f1f5f9]">Regra dos 20 Minutos Diários</h4>
          <p className="text-[11px] text-[#94a3b8] leading-relaxed">
            Estudar 20 a 30 minutos todos os dias gera retenção neurológica 4x superior a estudar 3 horas de uma vez só no domingo. Mantenha o ritmo!
          </p>
        </div>
      </section>
    </div>
  );
};

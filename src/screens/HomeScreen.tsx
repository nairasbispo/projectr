import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const HomeScreen: React.FC = () => {
  const {
    profile,
    activities,
    setActiveSection,
    setIsRegisterModalOpen,
    setSelectedActivityForDetails,
    totalMinutes,
    totalHoursFormatted,
    totalSessions,
    completedPercentA2,
    skillMinutesMap,
    skillPercentMap,
    currentStreakDays,
  } = useApp();

  const [period, setPeriod] = useState<'Hoje' | 'Esta semana' | 'Este mês' | 'Todos'>('Esta semana');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [skillTimeRange, setSkillTimeRange] = useState<'semana' | '30d' | 'mes'>('semana');

  const recentActivities = activities.slice(0, 4);

  // Weekly hours calculated
  const weeklyHoursTarget = profile.goals?.weeklyGoalHours || 5;
  const weeklyGoalPct = Math.min(100, Math.round(((totalMinutes / 60) / weeklyHoursTarget) * 100));

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pb-10 space-y-6 px-4 pt-4">
      {/* Top Greeting & Action Header */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-[30px] text-[#f8fafc] font-bold tracking-tight leading-tight">
              Olá, Reinan!
            </h1>
            <p className="text-xs text-[#94a3b8] mt-1 font-medium tracking-wide">
              Cada sessão te aproxima da fluência.
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
              className="flex items-center gap-1.5 bg-[#0e1422] border border-[#1e2a42] px-3.5 py-1.5 rounded-full text-[#f1f5f9] text-xs font-medium shadow-sm active:scale-95 transition-all hover:border-[#38bdf8]/40 hover:bg-[#131b2e]"
            >
              <span className="material-symbols-outlined text-[16px] text-[#38bdf8]">calendar_today</span>
              <span className="text-[#f1f5f9] font-medium">{period}</span>
              <span className="material-symbols-outlined text-[16px] text-[#64748b]">expand_more</span>
            </button>

            {isPeriodDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsPeriodDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-44 bg-[#0e1422] border border-[#1e2a42] rounded-2xl shadow-2xl z-20 overflow-hidden py-1.5 backdrop-blur-xl">
                  {(['Hoje', 'Esta semana', 'Este mês', 'Todos'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPeriod(p);
                        setIsPeriodDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#182236] transition-colors flex items-center justify-between ${
                        period === p ? 'text-[#38bdf8] font-bold bg-[#182236]/80' : 'text-[#cbd5e1]'
                      }`}
                    >
                      <span>{p}</span>
                      {period === p && <span className="material-symbols-outlined text-sm text-[#38bdf8]">check</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Logging Hero Banner Card (Refined Sapphire Glass with Shimmer Line) */}
        <div className="relative bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#1e3a8a] rounded-2xl p-4.5 text-white shadow-xl shadow-[#0284c7]/15 flex items-center justify-between gap-3 overflow-hidden border border-[#38bdf8]/30">
          <div className="absolute -right-6 -bottom-8 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-[#bae6fd] font-bold">
              Pronto para aprender?
            </span>
            <span className="text-[16px] text-white font-bold tracking-tight mt-0.5">
              Registre sua prática de hoje
            </span>
          </div>
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="relative z-10 inline-flex items-center gap-1.5 bg-white text-[#0284c7] hover:text-[#0369a1] text-xs px-3.5 py-2.5 rounded-xl shadow-lg hover:bg-slate-50 active:scale-95 transition-all flex-shrink-0 font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Registrar</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3">
        {/* KPI 1: Tempo Estudado */}
        <div className="bg-[#0e1422]/90 p-4 rounded-2xl shadow-xl border border-[#1e2a42] flex flex-col justify-between backdrop-blur-md hover:border-[#38bdf8]/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#0284c7]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
              <span className="material-symbols-outlined text-[18px]">timer</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#34d399] font-bold">
              {totalMinutes > 0 ? `+${totalMinutes % 60}m` : '0m'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748b] uppercase tracking-widest block font-bold">
              Tempo Estudado
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-serif text-[28px] text-[#f8fafc] font-bold leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {totalHoursFormatted}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-[11px] text-[#94a3b8]">Meta: {weeklyHoursTarget}h</span>
              <span className="text-[11px] font-bold text-[#38bdf8]">{weeklyGoalPct}%</span>
            </div>
            <div className="w-full bg-[#182236] h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#0284c7] to-[#38bdf8] h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${weeklyGoalPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Sessões Concluídas */}
        <div className="bg-[#0e1422]/90 p-4 rounded-2xl shadow-xl border border-[#1e2a42] flex flex-col justify-between backdrop-blur-md hover:border-[#38bdf8]/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#182236] border border-[#1e2a42] flex items-center justify-center text-[#94a3b8]">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#182236] text-[#94a3b8] font-medium border border-[#1e2a42]">
              Meta: 10
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748b] uppercase tracking-widest block font-bold">
              Sessões Concluídas
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-serif text-[28px] text-[#f8fafc] font-bold leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {totalSessions}
              </span>
              <span className="text-[11px] text-[#94a3b8]">sessões</span>
            </div>
            <p className="text-[11px] text-[#94a3b8] mt-2.5 truncate">
              Média <span className="font-bold text-[#f8fafc]">
                {totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0} min
              </span> / sessão
            </p>
          </div>
        </div>

        {/* KPI 3: Consistência */}
        <div className="bg-[#0e1422]/90 p-4 rounded-2xl shadow-xl border border-[#1e2a42] flex flex-col justify-between backdrop-blur-md hover:border-[#38bdf8]/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
              <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#fbbf24] font-bold border border-[#f59e0b]/30">
              {currentStreakDays}/7 dias
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748b] uppercase tracking-widest block font-bold">
              Consistência
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-serif text-[28px] text-[#f8fafc] font-bold leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {currentStreakDays}
              </span>
              <span className="text-[11px] text-[#94a3b8]">dias ativos</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              {[1, 2, 3, 4, 5, 6, 7].map((dotIndex) => (
                <span
                  key={dotIndex}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    dotIndex <= currentStreakDays
                      ? 'bg-[#10b981] shadow-xs shadow-[#10b981]/50'
                      : 'bg-[#1e2a42]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* KPI 4: Progresso para Target Level */}
        <div className="bg-[#0e1422]/90 p-4 rounded-2xl shadow-xl border border-[#1e2a42] flex flex-col justify-between backdrop-blur-md hover:border-[#38bdf8]/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#0284c7]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#182236] border border-[#38bdf8]/30 text-[#38bdf8] font-bold">
              Nível {profile.currentLevel}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748b] uppercase tracking-widest block font-bold">
              Rumo ao {profile.targetLevel}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-serif text-[28px] text-[#38bdf8] font-bold leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {completedPercentA2}%
              </span>
            </div>
            <p className="text-[11px] text-[#94a3b8] mt-2.5 truncate">
              <span className="font-bold text-[#f8fafc]">{Math.floor(totalMinutes / 60)}h</span> de {profile.targetHours}h meta
            </p>
          </div>
        </div>
      </div>

      {/* CEFR Level Pathway Progress Card */}
      <div className="bg-[#0e1422]/90 p-4.5 rounded-2xl shadow-xl border border-[#1e2a42] backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0284c7]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
              <span className="material-symbols-outlined text-[20px]">military_tech</span>
            </div>
            <div>
              <h2 className="text-[15px] text-[#f8fafc] font-bold tracking-tight">
                Rumo ao Nível {profile.targetLevel}
              </h2>
              <span className="text-xs text-[#94a3b8] block">
                {profile.targetLevel === 'A2'
                  ? 'Elementary'
                  : profile.targetLevel === 'B1'
                  ? 'Intermediate'
                  : profile.targetLevel === 'B2'
                  ? 'Upper Intermediate'
                  : 'Advanced'}{' '}
                — Quadro Europeu (CEFR)
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('cefr')}
            className="text-[10px] uppercase px-2.5 py-1 rounded-full bg-[#0284c7]/15 border border-[#38bdf8]/40 text-[#38bdf8] font-bold hover:bg-[#0284c7]/25 transition-colors"
          >
            {profile.currentLevel} → {profile.targetLevel}
          </button>
        </div>

        {/* Dual Metric Bar */}
        <div className="space-y-1.5 my-3.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#f8fafc] font-semibold">{totalHoursFormatted} praticadas</span>
            <span className="text-[#94a3b8]">
              Faltam {Math.max(0, profile.targetHours - Math.floor(totalMinutes / 60))} horas
            </span>
          </div>
          <div className="w-full bg-[#182236] h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-[#0284c7] to-[#38bdf8] h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${completedPercentA2}%` }}
            />
          </div>
          <div className="flex justify-between text-[#64748b] text-[10px]">
            <span>Início ({profile.currentLevel})</span>
            <span className="text-[#38bdf8] font-bold">Meta recomendada: {profile.targetHours}h</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-3 pt-3 bg-[#131b2e]/60 rounded-xl p-3 flex flex-col gap-2 border border-[#1e2a42]/80">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#38bdf8] mt-0.5">info</span>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Você pode alterar seu nível de partida e seu objetivo a qualquer momento na seção CEFR Levels.
            </p>
          </div>
          <button
            onClick={() => setActiveSection('cefr')}
            className="inline-flex items-center self-end gap-1 text-xs text-[#38bdf8] font-semibold hover:underline pt-1"
          >
            <span>Ver e configurar níveis CEFR</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Weekly Activity Distribution Chart */}
      <div className="bg-[#0e1422]/90 p-4.5 rounded-2xl shadow-xl border border-[#1e2a42] backdrop-blur-md">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-[15px] text-[#f8fafc] font-bold tracking-tight">Atividade da Semana</h2>
            <p className="text-xs text-[#94a3b8]">Distribuição diária de dedicação</p>
          </div>
          <span className="text-[11px] bg-[#131b2e] border border-[#1e2a42] px-2.5 py-1 rounded-full text-[#94a3b8] font-bold">
            Semana Atual
          </span>
        </div>

        {/* 7-Day Chart Matrix */}
        <div className="grid grid-cols-7 gap-1.5 pt-2 text-center">
          {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((day, idx) => {
            const isToday = idx === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
            const hasData = activities.length > 0 && idx < activities.length;
            const barHeight = hasData ? Math.min(60, 20 + idx * 8) : 0;

            return (
              <div key={day} className="flex flex-col items-center gap-1.5 relative">
                {isToday && (
                  <div className="absolute -top-1 w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
                )}
                <div className={`h-24 w-full rounded-xl flex flex-col justify-end p-1 gap-1 items-center border transition-all ${
                  isToday ? 'bg-[#0284c7]/20 border-[#38bdf8]/40 shadow-xs' : 'bg-[#131b2e] border-[#1e2a42]'
                }`}>
                  {barHeight > 0 ? (
                    <div
                      className="w-2.5 rounded-sm bg-[#38bdf8] shadow-xs"
                      style={{ height: `${barHeight}px` }}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[#64748b] text-[12px] mb-2">remove</span>
                  )}
                </div>
                <span className={`text-[10px] font-bold ${isToday ? 'text-[#38bdf8]' : 'text-[#64748b]'}`}>
                  {isToday ? 'HOJE' : day}
                </span>
                <span className="text-[11px] font-semibold text-[#f8fafc]">
                  {barHeight > 0 ? `${barHeight}m` : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tempo por Habilidade */}
      <div className="bg-[#0e1422]/90 p-4.5 rounded-2xl shadow-xl border border-[#1e2a42] backdrop-blur-md">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-[15px] text-[#f8fafc] font-bold tracking-tight">Tempo por Habilidade</h2>
            <p className="text-xs text-[#94a3b8]">Equilíbrio de competências</p>
          </div>
        </div>

        {/* Skill Breakdown Progress Bars */}
        <div className="space-y-3.5">
          {/* Listening */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#0284c7]/20 flex items-center justify-center text-[#38bdf8]">
                  <span className="material-symbols-outlined text-[16px]">headphones</span>
                </span>
                <span className="text-xs font-bold text-[#f8fafc]">Listening (Compreensão auditiva)</span>
              </div>
              <span className="text-xs font-bold text-[#38bdf8]">{skillMinutesMap.listening || 0}m</span>
            </div>
            <div className="w-full bg-[#131b2e] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#38bdf8] h-full rounded-full transition-all"
                style={{ width: `${skillPercentMap.listening || 0}%` }}
              />
            </div>
          </div>

          {/* Reading */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-900/40 flex items-center justify-center text-cyan-400">
                  <span className="material-symbols-outlined text-[16px]">menu_book</span>
                </span>
                <span className="text-xs font-bold text-[#f8fafc]">Reading (Leitura)</span>
              </div>
              <span className="text-xs font-bold text-cyan-400">{skillMinutesMap.reading || 0}m</span>
            </div>
            <div className="w-full bg-[#131b2e] h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all"
                style={{ width: `${skillPercentMap.reading || 0}%` }}
              />
            </div>
          </div>

          {/* Grammar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-900/40 flex items-center justify-center text-blue-400">
                  <span className="material-symbols-outlined text-[16px]">spellcheck</span>
                </span>
                <span className="text-xs font-bold text-[#f8fafc]">Grammar (Gramática)</span>
              </div>
              <span className="text-xs font-bold text-blue-400">{skillMinutesMap.grammar || 0}m</span>
            </div>
            <div className="w-full bg-[#131b2e] h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-400 h-full rounded-full transition-all"
                style={{ width: `${skillPercentMap.grammar || 0}%` }}
              />
            </div>
          </div>

          {/* Writing */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-900/40 flex items-center justify-center text-[#10b981]">
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                </span>
                <span className="text-xs font-bold text-[#f8fafc]">Writing (Escrita)</span>
              </div>
              <span className="text-xs font-bold text-[#10b981]">{skillMinutesMap.writing || 0}m</span>
            </div>
            <div className="w-full bg-[#131b2e] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#10b981] h-full rounded-full transition-all"
                style={{ width: `${skillPercentMap.writing || 0}%` }}
              />
            </div>
          </div>

          {/* Speaking */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-900/40 flex items-center justify-center text-amber-400">
                  <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                </span>
                <span className="text-xs font-bold text-[#f8fafc]">Speaking (Conversação)</span>
              </div>
              <span className="text-xs font-bold text-amber-400">{skillMinutesMap.speaking || 0}m</span>
            </div>
            <div className="w-full bg-[#131b2e] h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all"
                style={{ width: `${skillPercentMap.speaking || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="bg-[#0e1422]/90 p-4.5 rounded-2xl shadow-xl border border-[#1e2a42] backdrop-blur-md">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-[15px] text-[#f8fafc] font-bold tracking-tight">Atividades Recentes</h2>
            <p className="text-xs text-[#94a3b8]">Seus últimos registros salvos no Firebase</p>
          </div>
          <button
            onClick={() => setActiveSection('activities')}
            className="text-xs text-[#38bdf8] font-bold hover:underline"
          >
            Ver todas
          </button>
        </div>

        {recentActivities.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                onClick={() => setSelectedActivityForDetails(act)}
                className="p-3.5 bg-[#131b2e] rounded-xl flex items-center justify-between hover:bg-[#182236] transition-colors border border-[#1e2a42] cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#0284c7]/20 text-[#38bdf8] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">
                      {act.skill === 'listening'
                        ? 'headphones'
                        : act.skill === 'grammar'
                        ? 'spellcheck'
                        : act.skill === 'reading'
                        ? 'menu_book'
                        : act.skill === 'speaking'
                        ? 'record_voice_over'
                        : 'edit_note'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase text-[#38bdf8] font-bold">{act.skill}</span>
                      <span className="w-1 h-1 rounded-full bg-[#64748b]" />
                      <span className="text-[11px] text-[#94a3b8] truncate">{act.activityType}</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#f8fafc] truncate">{act.title}</h4>
                    <span className="text-[11px] text-[#64748b]">{act.date}, {act.time}</span>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right pl-2">
                  <span className="text-xs font-bold text-[#f8fafc] block">{act.durationMinutes} min</span>
                  <span className="text-[10px] text-[#10b981] font-bold">Concluído</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center space-y-2">
            <span className="material-symbols-outlined text-[#64748b] text-3xl">history_edu</span>
            <p className="text-xs text-[#94a3b8]">Nenhuma atividade registrada ainda.</p>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="text-xs text-[#38bdf8] font-bold hover:underline"
            >
              + Clique aqui para registrar sua primeira sessão
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

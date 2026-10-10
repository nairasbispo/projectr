import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CEFRLevel } from '../types';

export const CefrLevelsScreen: React.FC = () => {
  const { profile, updateLevels, totalMinutes, totalHoursFormatted, setFeedbackMessage } = useApp();

  const [currentLvl, setCurrentLvl] = useState<CEFRLevel>(profile.currentLevel || 'A1');
  const [targetLvl, setTargetLvl] = useState<CEFRLevel>(profile.targetLevel || 'A2');
  const [isSaved, setIsSaved] = useState(false);

  const cefrScale: {
    level: CEFRLevel;
    title: string;
    description: string;
    hoursReq: number;
    color: string;
    skills: string[];
  }[] = [
    {
      level: 'A1',
      title: 'Iniciante (Breakthrough)',
      description: 'Capaz de compreender e utilizar expressões familiares e cotidianas para necessidades básicas.',
      hoursReq: 80,
      color: 'from-sky-500 to-blue-600',
      skills: [
        'Apresentar-se e fazer perguntas simples',
        'Compreender frases curtas e familiares',
        'Preencher formulários com dados pessoais básicos',
      ],
    },
    {
      level: 'A2',
      title: 'Básico (Elementary)',
      description: 'Compreende frases e vocabulário frequente sobre compras, trabalho, rotina e família.',
      hoursReq: 100,
      color: 'from-blue-500 to-cyan-500',
      skills: [
        'Descrever aspectos da formação e rotina imediata',
        'Comunicação em tarefas simples e rotineiras',
        'Entender mensagens curtas e avisos comuns',
      ],
    },
    {
      level: 'B1',
      title: 'Intermediário (Threshold)',
      description: 'Lida com a maioria das situações de viagem e descreve experiências, eventos, sonhos e ambições.',
      hoursReq: 200,
      color: 'from-emerald-500 to-teal-500',
      skills: [
        'Compreender pontos principais de textos cotidianos',
        'Expressar opiniões e explicar planos brevemente',
        'Produzir textos conectados sobre tópicos de interesse',
      ],
    },
    {
      level: 'B2',
      title: 'Independente (Vantage)',
      description: 'Compreende ideias de textos complexos e conversa com nativos com boa fluência e espontaneidade.',
      hoursReq: 400,
      color: 'from-amber-500 to-orange-500',
      skills: [
        'Compreender palestras e argumentos elaborados',
        'Interagir com espontaneidade sem esforço excessivo',
        'Escrever ensaios e relatórios claros e detalhados',
      ],
    },
    {
      level: 'C1',
      title: 'Avançado (Effective)',
      description: 'Uso flexível e eficiente do idioma para fins sociais, acadêmicos e profissionais avançados.',
      hoursReq: 600,
      color: 'from-indigo-500 to-violet-600',
      skills: [
        'Compreender ampla variedade de textos longos e exigentes',
        'Expressar-se fluentemente sem buscar palavras',
        'Produzir textos claros, bem estruturados e complexos',
      ],
    },
    {
      level: 'C2',
      title: 'Domínio Pleno (Mastery)',
      description: 'Compreensão sem esforço de praticamente tudo que ouve ou lê. Expressão com precisão nativa.',
      hoursReq: 800,
      color: 'from-rose-500 to-pink-600',
      skills: [
        'Resumir informações de diferentes fontes faladas/escritas',
        'Diferenciar nuances sutis de significado',
        'Comunicação perfeita mesmo em áreas altamente técnicas',
      ],
    },
  ];

  const targetReqHours = cefrScale.find((c) => c.level === targetLvl)?.hoursReq || 100;
  const progressPct = Math.min(100, Math.round(((totalMinutes / 60) / targetReqHours) * 100));
  const remainingHours = Math.max(0, targetReqHours - Math.floor(totalMinutes / 60));

  const handleSaveLevels = async () => {
    await updateLevels(currentLvl, targetLvl);
    setIsSaved(true);
    setFeedbackMessage(`Nível atual atualizado para ${currentLvl} e objetivo para ${targetLvl}!`);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pb-12 space-y-5 px-4 pt-4">
      {/* Header */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#0284c7]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
            <span className="material-symbols-outlined text-[18px]">military_tech</span>
          </span>
          <span className="text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider">
            Quadro Europeu de Referência
          </span>
        </div>
        <h1 className="font-serif text-2xl text-[#f1f5f9] font-bold tracking-tight">
          Níveis CEFR & Objetivo
        </h1>
        <p className="text-xs text-[#94a3b8]">
          Acompanhe sua trajetória de proficiência e ajuste seu nível atual e objetivo a qualquer momento.
        </p>
      </section>

      {/* Interactive Level & Goal Changer Card */}
      <section className="bg-[#111726] border border-[#1e293b] rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">tune</span>
            <h2 className="text-sm font-semibold text-[#f1f5f9]">Configurar Meu Nível e Meta</h2>
          </div>
          {isSaved && (
            <span className="text-[11px] font-bold text-[#10b981] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check</span> Salvo no Firebase
            </span>
          )}
        </div>

        {/* Current Level Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#94a3b8] mb-2">
            1. Em qual nível você está atualmente?
          </label>
          <div className="grid grid-cols-6 gap-1.5">
            {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => {
              const isSelected = currentLvl === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setCurrentLvl(lvl)}
                  className={`h-11 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border ${
                    isSelected
                      ? 'bg-[#0284c7] text-white border-[#38bdf8] shadow-md shadow-[#0284c7]/30 scale-105'
                      : 'bg-[#182236] text-[#94a3b8] border-[#1e293b] hover:text-[#f1f5f9] hover:bg-[#1e293b]'
                  }`}
                >
                  <span>{lvl}</span>
                  <span className="text-[9px] font-normal opacity-80">
                    {lvl.startsWith('A') ? 'Básico' : lvl.startsWith('B') ? 'Interm.' : 'Avanç.'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Level Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#94a3b8] mb-2">
            2. Qual é o seu nível de objetivo (Target)?
          </label>
          <div className="grid grid-cols-6 gap-1.5">
            {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => {
              const isSelected = targetLvl === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setTargetLvl(lvl)}
                  className={`h-11 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border ${
                    isSelected
                      ? 'bg-[#10b981] text-white border-[#34d399] shadow-md shadow-[#10b981]/30 scale-105'
                      : 'bg-[#182236] text-[#94a3b8] border-[#1e293b] hover:text-[#f1f5f9] hover:bg-[#1e293b]'
                  }`}
                >
                  <span>{lvl}</span>
                  <span className="text-[9px] font-normal opacity-80">Meta</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveLevels}
          className="w-full h-11 bg-gradient-to-r from-[#0284c7] to-[#2563eb] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Salvar Nível e Objetivo ({currentLvl} → {targetLvl})</span>
        </button>
      </section>

      {/* Target Progress Card */}
      <section className="bg-[#111726] border border-[#1e293b] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-[#64748b]">Jornada Atual</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#0284c7]/20 border border-[#38bdf8]/30 text-[#38bdf8]">
              {profile.currentLevel} → {profile.targetLevel}
            </span>
          </div>
          <span className="text-sm font-bold text-[#38bdf8]">{progressPct}% concluído</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#94a3b8]">
            <span>{totalHoursFormatted} estudadas</span>
            <span>Faltam {remainingHours}h para a meta</span>
          </div>
          <div className="w-full bg-[#182236] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#0284c7] to-[#38bdf8] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#64748b]">
            <span>Início</span>
            <span>Meta recomendada: {targetReqHours}h</span>
          </div>
        </div>
      </section>

      {/* CEFR Scale Explorer */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wider px-1">
          Escala Completa de Proficiência
        </h3>

        <div className="space-y-2.5">
          {cefrScale.map((item) => {
            const isCurrent = profile.currentLevel === item.level;
            const isTarget = profile.targetLevel === item.level;

            return (
              <div
                key={item.level}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-[#182236] border-[#38bdf8]/60 shadow-lg shadow-[#0284c7]/10'
                    : isTarget
                    ? 'bg-[#111726] border-[#10b981]/50'
                    : 'bg-[#111726] border-[#1e293b]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#182236] border border-[#1e293b] flex items-center justify-center font-bold text-xs text-[#f1f5f9]">
                      {item.level}
                    </span>
                    <h4 className="text-sm font-bold text-[#f1f5f9]">{item.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-bold bg-[#0284c7] text-white px-2 py-0.5 rounded-full">
                        Você está aqui
                      </span>
                    )}
                    {isTarget && (
                      <span className="text-[10px] uppercase font-bold bg-[#10b981] text-white px-2 py-0.5 rounded-full">
                        Seu Objetivo
                      </span>
                    )}
                    <span className="text-xs text-[#64748b]">{item.hoursReq}h</span>
                  </div>
                </div>

                <p className="text-xs text-[#94a3b8] mb-2.5 leading-relaxed">{item.description}</p>

                <div className="space-y-1 pt-2 border-t border-[#1e293b]/70">
                  {item.skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-[#cbd5e1]">
                      <span className="w-1 h-1 rounded-full bg-[#38bdf8]" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

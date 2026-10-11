import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SkillType } from '../types';

export const RegisterStudyModal: React.FC = () => {
  const {
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    selectedActivityForEdit,
    setSelectedActivityForEdit,
    addActivity,
    updateActivity,
    setFeedbackMessage,
  } = useApp();

  const [selectedSkill, setSelectedSkill] = useState<SkillType>('listening');
  const [selectedActivityType, setSelectedActivityType] = useState('YouTube');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
    if (selectedActivityForEdit) {
      setSelectedSkill(selectedActivityForEdit.skill);
      setSelectedActivityType(selectedActivityForEdit.activityType);
      setDurationMinutes(selectedActivityForEdit.durationMinutes);
      setTitle(selectedActivityForEdit.title);
      setUrl(selectedActivityForEdit.url || '');
      setNotes(selectedActivityForEdit.notes || '');
      setDateStr(selectedActivityForEdit.date);
    } else {
      setSelectedSkill('listening');
      setSelectedActivityType('YouTube');
      setDurationMinutes(25);
      setTitle('');
      setUrl('');
      setNotes('');
      setDateStr(new Date().toISOString().slice(0, 10));
    }
  }, [selectedActivityForEdit, isRegisterModalOpen]);

  if (!isRegisterModalOpen) return null;

  const activityChipsBySkill: Record<SkillType, string[]> = {
    listening: ['YouTube', 'Podcasts', 'Filmes & Séries', 'Música', 'Audiobooks', 'Outro'],
    speaking: ['Shadowing', 'Conversação', 'Leitura em voz alta', 'App Áudio', 'Pronúncia', 'Outro'],
    writing: ['Diário em inglês', 'Redação guiada', 'Frases cotidianas', 'Resumo de texto', 'Outro'],
    reading: ['Artigo curto', 'Notícias A1', 'Livro graduado', 'Contos curtos', 'Gramática', 'Outro'],
    grammar: ['Present Simple', 'Past Simple', 'Present Continuous', 'Preposições', 'Exercícios livro', 'Outro'],
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const finalTitle = title.trim() || `${selectedSkill.toUpperCase()} - ${selectedActivityType}`;
    const now = new Date();
    const time = `${now.getHours() < 10 ? '0' : ''}${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

    try {
      if (selectedActivityForEdit) {
        await updateActivity(selectedActivityForEdit.id, {
          skill: selectedSkill,
          activityType: selectedActivityType,
          durationMinutes,
          date: dateStr,
          title: finalTitle,
          url: url.trim() || '',
          notes: notes.trim() || '',
        });
        setFeedbackMessage('Sessão atualizada com sucesso no Firestore!');
      } else {
        await addActivity({
          skill: selectedSkill,
          activityType: selectedActivityType,
          durationMinutes,
          date: dateStr,
          time,
          title: finalTitle,
          url: url.trim() || '',
          notes: notes.trim() || '',
        });
        setFeedbackMessage(`+${durationMinutes} min em ${selectedSkill.toUpperCase()} salvos no Firestore!`);
      }

      setIsRegisterModalOpen(false);
      setSelectedActivityForEdit(null);
    } catch (e: any) {
      console.error('Error saving study session:', e);
      setErrorMessage(
        e?.message?.includes('permission')
          ? 'Erro de permissão no Firebase. As regras foram atualizadas, tente novamente.'
          : 'Não foi possível gravar a sessão no banco de dados. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const hourFormatted = hours > 0 ? `${hours}h ` : '0h ';
  const minFormatted = mins < 10 ? `0${mins}m` : `${mins}m`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0e17] flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 inset-x-0 z-10 bg-[#0a0e17]/95 backdrop-blur-xl border-b border-[#1e293b]">
        <div className="h-16 px-4 max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsRegisterModalOpen(false);
                setSelectedActivityForEdit(null);
              }}
              aria-label="Voltar"
              className="w-9 h-9 flex items-center justify-center text-[#94a3b8] hover:text-white rounded-lg hover:bg-[#111726]"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
            </button>
            <h1 className="font-semibold text-base text-[#f1f5f9] tracking-tight">
              {selectedActivityForEdit ? 'Editar Estudo' : 'Registrar Estudo'}
            </h1>
          </div>

          <button
            onClick={() => {
              setIsRegisterModalOpen(false);
              setSelectedActivityForEdit(null);
            }}
            className="text-xs text-[#94a3b8] hover:text-white font-semibold"
          >
            Fechar
          </button>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="flex-1 w-full max-w-lg mx-auto p-4 pb-12 space-y-5">
        <div>
          <span className="bg-[#0284c7]/20 border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {selectedActivityForEdit ? 'Edição' : 'Novo Registro'}
          </span>
          <h2 className="font-serif text-2xl text-[#f1f5f9] font-bold tracking-tight mt-1">
            Registrar Prática Diária
          </h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Os minutos inseridos atualizam automaticamente seus gráficos e métricas de fluência.
          </p>
        </div>

        {/* Error notification if save failed */}
        {errorMessage && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-xs p-3 rounded-xl flex items-center justify-between gap-2 animate-shake">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Step 1: Selecione a Habilidade */}
        <section className="bg-[#111726] border border-[#1e293b] rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0284c7] text-white text-[11px] flex items-center justify-center font-bold">
                1
              </span>
              <h3 className="font-semibold text-sm text-[#f1f5f9]">Habilidade Praticada</h3>
            </div>
            <span className="text-[11px] text-[#64748b]">Obrigatório</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'listening', name: 'Listening', icon: 'headphones', desc: 'Compreensão auditiva e percepção fonética' },
              { id: 'speaking', name: 'Speaking', icon: 'mic', desc: 'Conversação, pronúncia e repetição em voz alta' },
              { id: 'writing', name: 'Writing', icon: 'edit_note', desc: 'Escrita, redação, frases e vocabulário' },
              { id: 'reading', name: 'Reading', icon: 'menu_book', desc: 'Leitura de artigos, notícias e contos' },
              { id: 'grammar', name: 'Grammar', icon: 'spellcheck', desc: 'Estruturas, tempos verbais e regras essenciais' },
            ].map((skill) => {
              const isSelected = selectedSkill === skill.id;
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => {
                    setSelectedSkill(skill.id as SkillType);
                    setSelectedActivityType(activityChipsBySkill[skill.id as SkillType][0]);
                  }}
                  className={`p-3 rounded-xl text-left flex items-center justify-between border transition-all ${
                    isSelected
                      ? 'bg-[#0284c7]/15 border-[#38bdf8] text-[#f1f5f9]'
                      : 'bg-[#182236] border-[#1e293b] text-[#94a3b8] hover:border-[#38bdf8]/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-[#0284c7] text-white' : 'bg-[#111726] text-[#94a3b8]'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">{skill.icon}</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold block text-[#f1f5f9]">{skill.name}</span>
                      <span className="text-[11px] text-[#94a3b8]">{skill.desc}</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    isSelected ? 'bg-[#0284c7] border-[#38bdf8] text-white' : 'border-[#1e293b]'
                  }`}>
                    {isSelected && <span className="material-symbols-outlined text-xs">check</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Tipo de Atividade */}
        <section className="bg-[#111726] border border-[#1e293b] rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0284c7] text-white text-[11px] flex items-center justify-center font-bold">
                2
              </span>
              <h3 className="font-semibold text-sm text-[#f1f5f9]">Formato / Recurso</h3>
            </div>
            <span className="text-xs uppercase font-bold text-[#38bdf8]">{selectedSkill}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {activityChipsBySkill[selectedSkill].map((chip) => {
              const isSelected = selectedActivityType === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSelectedActivityType(chip)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-[#0284c7] text-white border-[#38bdf8]'
                      : 'bg-[#182236] text-[#94a3b8] border-[#1e293b] hover:text-white'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 3: Duração */}
        <section className="bg-[#111726] border border-[#1e293b] rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0284c7] text-white text-[11px] flex items-center justify-center font-bold">
                3
              </span>
              <h3 className="font-semibold text-sm text-[#f1f5f9]">Duração do Estudo</h3>
            </div>
            <span className="text-xs text-[#94a3b8]">Minutos</span>
          </div>

          {/* Dial display */}
          <div className="bg-[#182236] rounded-xl p-4 text-center border border-[#1e293b]">
            <span className="text-4xl font-bold text-[#38bdf8]">{durationMinutes}</span>
            <span className="font-serif text-xl text-[#f1f5f9] ml-1">min</span>
            <span className="text-xs text-[#94a3b8] block mt-1">
              Equivale a {hourFormatted}{minFormatted}
            </span>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-4 gap-1.5">
            {[10, 15, 20, 25, 30, 45, 60, 90].map((minsVal) => (
              <button
                key={minsVal}
                type="button"
                onClick={() => setDurationMinutes(minsVal)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  durationMinutes === minsVal
                    ? 'bg-[#0284c7] text-white border-[#38bdf8]'
                    : 'bg-[#182236] text-[#94a3b8] border-[#1e293b] hover:text-white'
                }`}
              >
                {minsVal} min
              </button>
            ))}
          </div>

          {/* Fine stepper */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#64748b]">Ajuste Fino (+ / - 1 min):</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDurationMinutes((p) => Math.max(1, p - 1))}
                className="w-9 h-9 rounded-lg bg-[#182236] text-[#f1f5f9] border border-[#1e293b] font-bold text-lg flex items-center justify-center hover:bg-[#1e293b]"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setDurationMinutes((p) => p + 1)}
                className="w-9 h-9 rounded-lg bg-[#182236] text-[#f1f5f9] border border-[#1e293b] font-bold text-lg flex items-center justify-center hover:bg-[#1e293b]"
              >
                +
              </button>
            </div>
          </div>
        </section>

        {/* Step 4: Detalhes Opcionais */}
        <section className="bg-[#111726] border border-[#1e293b] rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#182236] text-[#94a3b8] text-[11px] flex items-center justify-center font-bold">
                4
              </span>
              <h3 className="font-semibold text-sm text-[#f1f5f9]">Detalhes Opcionais</h3>
            </div>
            <span className="text-[11px] text-[#64748b]">Opcional</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1">Data</label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full h-10 px-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] outline-none focus:border-[#38bdf8]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1">
                Título do material ou conteúdo
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: BBC 6 Minute English - Episode #420"
                className="w-full h-10 px-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] placeholder:text-[#64748b] outline-none focus:border-[#38bdf8]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1">Link do recurso (URL)</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full h-10 px-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] placeholder:text-[#64748b] outline-none focus:border-[#38bdf8]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1">Anotações / Resumo</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="O que você aprendeu de novo nesta sessão..."
                className="w-full p-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] placeholder:text-[#64748b] outline-none focus:border-[#38bdf8] resize-none"
              />
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSave}
            className="w-full h-12 bg-gradient-to-r from-[#0284c7] to-[#2563eb] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0284c7]/20 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">check</span>
            <span>{isSubmitting ? 'Salvando no Firebase...' : 'Salvar Sessão'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegisterModalOpen(false);
              setSelectedActivityForEdit(null);
            }}
            className="w-full h-10 bg-[#111726] border border-[#1e293b] text-[#94a3b8] hover:text-white rounded-xl text-xs font-medium"
          >
            Cancelar
          </button>
        </div>
      </main>
    </div>
  );
};

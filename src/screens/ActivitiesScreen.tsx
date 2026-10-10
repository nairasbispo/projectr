import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, SkillType } from '../types';

export const ActivitiesScreen: React.FC = () => {
  const {
    activities,
    deleteActivity,
    setSelectedActivityForDetails,
    setSelectedActivityForEdit,
    setIsRegisterModalOpen,
    totalMinutes,
    totalHoursFormatted,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | SkillType>('all');
  const [visibleLimit, setVisibleLimit] = useState(10);
  const [selectedActionActivity, setSelectedActionActivity] = useState<Activity | null>(null);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const filteredActivities = useMemo(() => {
    return activities
      .filter((act) => {
        const matchesCategory = activeCategory === 'all' || act.skill === activeCategory;
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          act.title.toLowerCase().includes(query) ||
          act.activityType.toLowerCase().includes(query) ||
          (act.notes && act.notes.toLowerCase().includes(query));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
  }, [activities, activeCategory, searchQuery]);

  const handleDeleteConfirmed = async () => {
    if (selectedActionActivity) {
      await deleteActivity(selectedActionActivity.id);
      setIsDeleteConfirmOpen(false);
      setIsActionSheetOpen(false);
      setSelectedActionActivity(null);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pb-12 space-y-5 px-4 pt-4">
      {/* Header */}
      <section className="flex flex-col gap-1 pt-1">
        <h1 className="font-serif text-2xl text-[#f1f5f9] font-bold tracking-tight">
          Minhas Atividades
        </h1>
        <p className="text-xs text-[#94a3b8]">Histórico completo de sessões sincronizadas em tempo real.</p>

        {/* Stats Strip */}
        <div className="bg-[#111726] rounded-2xl p-4 shadow-xl border border-[#1e293b] flex items-center justify-between gap-3 mt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7]/20 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] shrink-0">
              <span className="material-symbols-outlined text-[20px]">timer</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-[#64748b] font-bold tracking-wider">
                Tempo Total Acumulado
              </span>
              <span className="text-lg text-[#f1f5f9] tracking-tight font-bold">
                {totalHoursFormatted} ({totalMinutes} min)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[#94a3b8] bg-[#182236] px-3 py-1 rounded-full border border-[#1e293b]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span className="text-xs font-semibold text-[#f1f5f9]">{activities.length} sessões</span>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="space-y-2.5">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, tópico ou anotação..."
            className="w-full h-10 pl-10 pr-4 bg-[#111726] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] placeholder:text-[#64748b] outline-none focus:border-[#38bdf8]"
          />
        </div>

        {/* Skill Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(['all', 'listening', 'speaking', 'writing', 'reading', 'grammar'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border ${
                activeCategory === cat
                  ? 'bg-[#0284c7] text-white border-[#38bdf8]'
                  : 'bg-[#111726] text-[#94a3b8] border-[#1e293b] hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Todas' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Activity Cards Feed */}
      <section className="space-y-3">
        {filteredActivities.slice(0, visibleLimit).map((act) => (
          <article
            key={act.id}
            onClick={() => setSelectedActivityForDetails(act)}
            className="bg-[#111726] border border-[#1e293b] rounded-2xl p-4 shadow-xl hover:border-[#38bdf8]/40 transition-all flex flex-col gap-2.5 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0284c7]/20 border border-[#38bdf8]/30 text-[#38bdf8] uppercase">
                  {act.skill}
                </span>
                <span className="text-[11px] text-[#94a3b8] bg-[#182236] px-2 py-0.5 rounded-md border border-[#1e293b]">
                  {act.activityType}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="bg-[#182236] text-[#f1f5f9] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#1e293b]">
                  {act.durationMinutes} min
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedActionActivity(act);
                    setIsActionSheetOpen(true);
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#182236]"
                >
                  <span className="material-symbols-outlined text-[18px]">more_vert</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#f1f5f9] hover:text-[#38bdf8] transition-colors">
                {act.title}
              </h3>
              {act.notes && (
                <p className="text-xs text-[#94a3b8] line-clamp-2 mt-1">
                  &ldquo;{act.notes}&rdquo;
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1e293b] text-[11px] text-[#64748b]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#38bdf8]">schedule</span>
                <span>{act.date}, {act.time}</span>
              </div>
              <span className="text-[#38bdf8] font-semibold hover:underline">Ver detalhes →</span>
            </div>
          </article>
        ))}

        {filteredActivities.length === 0 && (
          <div className="bg-[#111726] border border-[#1e293b] rounded-2xl p-8 text-center space-y-3">
            <span className="material-symbols-outlined text-[#64748b] text-3xl">history_toggle_off</span>
            <h3 className="text-sm font-bold text-[#f1f5f9]">Nenhuma atividade encontrada</h3>
            <p className="text-xs text-[#94a3b8] max-w-xs mx-auto">
              {activities.length === 0
                ? 'O aplicativo está limpo para você registrar suas próprias sessões.'
                : 'Nenhuma sessão com esse termo de busca.'}
            </p>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2 bg-[#0284c7] text-white text-xs font-semibold rounded-xl shadow-md"
            >
              + Registrar Nova Prática
            </button>
          </div>
        )}

        {filteredActivities.length > visibleLimit && (
          <button
            onClick={() => setVisibleLimit((prev) => prev + 10)}
            className="w-full h-11 bg-[#111726] border border-[#1e293b] text-[#38bdf8] text-xs font-semibold rounded-xl hover:bg-[#182236] transition-all"
          >
            Carregar mais atividades (+10)
          </button>
        )}
      </section>

      {/* Action Bottom Sheet */}
      {isActionSheetOpen && selectedActionActivity && (
        <div
          className="fixed inset-0 z-50 bg-[#000000]/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setIsActionSheetOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#111726] border border-[#1e293b] rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
              <h4 className="text-sm font-bold text-[#f1f5f9] truncate">
                {selectedActionActivity.title}
              </h4>
              <button
                onClick={() => setIsActionSheetOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedActivityForEdit(selectedActionActivity);
                  setIsActionSheetOpen(false);
                  setIsRegisterModalOpen(true);
                }}
                className="w-full h-11 px-3 rounded-xl flex items-center gap-3 text-left hover:bg-[#182236] text-[#f1f5f9] text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-[18px] text-[#38bdf8]">edit</span>
                <span>Editar Sessão</span>
              </button>

              <button
                onClick={() => {
                  setIsActionSheetOpen(false);
                  setIsDeleteConfirmOpen(true);
                }}
                className="w-full h-11 px-3 rounded-xl flex items-center gap-3 text-left hover:bg-[#182236] text-red-400 text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                <span>Excluir do Histórico</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && selectedActionActivity && (
        <div
          className="fixed inset-0 z-50 bg-[#000000]/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsDeleteConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#111726] border border-[#1e293b] rounded-2xl p-5 shadow-2xl text-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>
            <h4 className="text-sm font-bold text-[#f1f5f9]">Excluir atividade?</h4>
            <p className="text-xs text-[#94a3b8]">
              Deseja remover &ldquo;{selectedActionActivity.title}&rdquo;? Esta ação removerá o registro do Firebase.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="h-10 rounded-xl bg-[#182236] text-[#94a3b8] text-xs font-semibold hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="h-10 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

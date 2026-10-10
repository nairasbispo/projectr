import React from 'react';
import { useApp } from '../context/AppContext';

export const ActivityDetailsModal: React.FC = () => {
  const {
    selectedActivityForDetails,
    setSelectedActivityForDetails,
    setSelectedActivityForEdit,
    setIsRegisterModalOpen,
  } = useApp();

  if (!selectedActivityForDetails) return null;

  const act = selectedActivityForDetails;

  const handleEdit = () => {
    setSelectedActivityForEdit(act);
    setSelectedActivityForDetails(null);
    setIsRegisterModalOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#000000]/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setSelectedActivityForDetails(null)}
    >
      <div
        className="w-full max-w-md bg-[#111726] border border-[#1e293b] rounded-2xl p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="inline-flex self-start px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0284c7]/20 border border-[#38bdf8]/30 text-[#38bdf8] uppercase">
              {act.skill}
            </span>
            <h3 className="text-base text-[#f1f5f9] font-bold pt-1">{act.title}</h3>
          </div>
          <button
            onClick={() => setSelectedActivityForDetails(null)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-white"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 bg-[#182236] p-3 rounded-xl border border-[#1e293b]">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-[#64748b] font-bold">Duração</span>
            <span className="text-xl text-[#38bdf8] font-bold">{act.durationMinutes} min</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-[#64748b] font-bold">Horário / Data</span>
            <span className="text-xs text-[#f1f5f9] font-bold mt-1">
              {act.time} ({act.date})
            </span>
          </div>
        </div>

        {act.url && (
          <div className="space-y-1">
            <span className="text-[10px] uppercase text-[#64748b] font-bold">Link do Recurso</span>
            <a
              href={act.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#38bdf8] hover:underline flex items-center gap-1 truncate"
            >
              <span className="material-symbols-outlined text-[14px]">link</span>
              <span className="truncate">{act.url}</span>
            </a>
          </div>
        )}

        <div className="space-y-1">
          <span className="text-[10px] uppercase text-[#64748b] font-bold">Anotações</span>
          <div className="text-xs text-[#cbd5e1] bg-[#182236] rounded-xl p-3 border border-[#1e293b] leading-relaxed">
            {act.notes || 'Sem anotações registradas para esta atividade.'}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
          <button
            onClick={() => setSelectedActivityForDetails(null)}
            className="h-10 px-4 rounded-xl bg-[#182236] text-[#94a3b8] text-xs font-semibold hover:text-white"
          >
            Fechar
          </button>
          <button
            onClick={handleEdit}
            className="h-10 px-4 rounded-xl bg-[#0284c7] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#0284c7]/20 hover:brightness-110"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};

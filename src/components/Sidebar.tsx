import React from 'react';
import { useApp, NavigationSection } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    activeSection,
    setActiveSection,
    profile,
    setIsRegisterModalOpen,
    isSyncing,
    clearAllData,
  } = useApp();

  if (!isSidebarOpen) return null;

  const handleNav = (section: NavigationSection) => {
    setActiveSection(section);
    setIsSidebarOpen(false);
  };

  const menuItems: { id: NavigationSection; label: string; icon: string; desc: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      desc: 'Gráficos e visão geral de progresso',
    },
    {
      id: 'cefr',
      label: 'CEFR Levels',
      icon: 'military_tech',
      desc: 'Quadro Europeu, nível atual e objetivo',
    },
    {
      id: 'grammar',
      label: 'Grammar',
      icon: 'spellcheck',
      desc: 'Regras, estruturas e anotações',
    },
    {
      id: 'vocabulary',
      label: 'Vocabulary',
      icon: 'menu_book',
      desc: 'Caderno pessoal e flashcards',
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: 'flag',
      desc: 'Metas de estudo diárias e semanais',
    },
    {
      id: 'activities',
      label: 'Histórico de Atividades',
      icon: 'history',
      desc: 'Registros detalhados de estudo',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000000]/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Drawer Container */}
      <aside className="relative w-80 max-w-[85vw] h-full bg-[#111726] border-r border-[#1e293b] text-[#f1f5f9] flex flex-col justify-between shadow-2xl z-10 animate-slide-right overflow-y-auto">
        {/* Top Header */}
        <div className="p-5 border-b border-[#1e293b]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Custom High-tech Vector Logo Icon for Project R */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#2563eb] flex items-center justify-center text-white shadow-lg shadow-[#0284c7]/20 border border-[#38bdf8]/40">
                <span className="font-serif font-black text-xl tracking-tighter">R</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-tight text-[#f1f5f9]">Project R</span>
                <span className="text-[11px] text-[#38bdf8] font-semibold tracking-wider uppercase">
                  Language Tracker
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#182236] transition-colors"
              aria-label="Fechar menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Workspace section requested by user */}
          <div className="mt-5 pt-4 border-t border-[#1e293b]/70 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              Workspace
            </span>

            <div className="flex flex-col gap-1 mt-1">
              <button
                onClick={() => handleNav('dashboard')}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#182236] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#38bdf8]">view_compact</span>
                  <span>Overview</span>
                </div>
                <span className="text-[10px] bg-[#1e293b] text-[#94a3b8] px-2 py-0.5 rounded-full">Geral</span>
              </button>

              <button
                onClick={() => handleNav('cefr')}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#f1f5f9] bg-[#182236]/80 border border-[#1e293b]"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#38bdf8]">translate</span>
                  <span>English</span>
                </div>
                {/* Level indicator badge right next to it */}
                <div className="flex items-center gap-1.5 bg-[#0284c7]/20 border border-[#38bdf8]/40 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                  <span className="text-[11px] font-bold text-[#38bdf8] uppercase">
                    Nível {profile.currentLevel}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-4 space-y-1">
          <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider px-3 mb-2 block">
            Navegação
          </span>

          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-[#0284c7]/15 text-[#38bdf8] border border-[#0284c7]/30 font-semibold'
                    : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#182236]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? 'text-[#38bdf8]' : 'text-[#64748b]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm">{item.label}</span>
                    <span className="text-[11px] text-[#64748b] line-clamp-1">{item.desc}</span>
                  </div>
                </div>

                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                )}
              </button>
            );
          })}

          {/* Quick Register CTA inside sidebar */}
          <div className="pt-3 px-1">
            <button
              onClick={() => {
                setIsSidebarOpen(false);
                setIsRegisterModalOpen(true);
              }}
              className="w-full h-11 bg-gradient-to-r from-[#0284c7] to-[#2563eb] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-[#0284c7]/20 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Registrar Estudo</span>
            </button>
          </div>
        </div>

        {/* Footer info & Zero App control */}
        <div className="p-4 border-t border-[#1e293b] bg-[#0c1220] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Minimalist vector avatar (No photo!) */}
              <div className="w-8 h-8 rounded-full bg-[#182236] border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] font-bold text-xs">
                {profile.displayName?.slice(0, 1).toUpperCase() || 'E'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-[#f1f5f9]">{profile.displayName}</span>
                <span className="text-[10px] text-[#64748b]">
                  {isSyncing ? 'Sincronizando...' : 'Firebase Conectado'}
                </span>
              </div>
            </div>

            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" title="Online" />
          </div>

          {/* Zero App Button */}
          <button
            onClick={() => {
              if (confirm('Deseja zerar todos os dados do aplicativo para começar limpo?')) {
                clearAllData();
                setIsSidebarOpen(false);
              }
            }}
            className="w-full text-center py-2 px-3 rounded-lg text-[11px] text-[#f87171] hover:bg-[#f87171]/10 border border-[#f87171]/20 font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
            <span>Zerar todos os dados do app</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

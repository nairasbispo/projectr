import React from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { profile, isSyncing, setIsSidebarOpen, setActiveSection } = useApp();

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#070b12]/85 backdrop-blur-xl pt-safe border-b border-[#1e2a42]/80 shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
      <div className="h-16 px-4 max-w-lg mx-auto flex items-center justify-between">
        {/* Left: Menu button + Logo */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menu lateral"
            className="w-9 h-9 rounded-xl bg-[#0e1422] border border-[#1e2a42] flex items-center justify-center text-[#94a3b8] hover:text-[#38bdf8] hover:border-[#38bdf8]/40 transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>

          <div
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            onClick={() => setActiveSection('dashboard')}
          >
            {/* Custom Vector Icon for Project R */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#1e40af] flex items-center justify-center text-white shadow-md shadow-[#0284c7]/25 border border-[#38bdf8]/40 group-hover:border-[#38bdf8] transition-colors">
              <span className="font-serif font-black text-sm tracking-tighter">R</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-[17px] text-[#f8fafc] tracking-tight font-bold leading-tight group-hover:text-[#38bdf8] transition-colors">
                Project R
              </span>
            </div>
          </div>
        </div>

        {/* Right: Sync indicator + Level Badge + Monogram Profile */}
        <div className="flex items-center gap-2">
          {isSyncing && (
            <span
              title="Sincronizando com Firestore"
              className="text-xs text-[#38bdf8] flex items-center gap-1 animate-pulse"
            >
              <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            </span>
          )}

          {/* Level Badge */}
          <button
            onClick={() => setActiveSection('cefr')}
            className="flex items-center gap-1.5 bg-[#0e1422] border border-[#38bdf8]/30 hover:border-[#38bdf8] px-2.5 py-1 rounded-full shadow-xs transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
            <span className="text-[11px] text-[#38bdf8] uppercase tracking-wider font-bold">
              Nível {profile.currentLevel}
            </span>
          </button>

          {/* User Profile Monogram Avatar (Refined initial 'R', NO photo) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-8 h-8 rounded-full bg-[#141c2e] border border-[#1e2a42] hover:border-[#38bdf8]/60 flex items-center justify-center text-[#38bdf8] font-bold text-xs transition-all active:scale-95 shadow-xs"
            aria-label="Menu e perfil"
          >
            {profile.displayName?.slice(0, 1).toUpperCase() || 'R'}
          </button>
        </div>
      </div>
    </header>
  );
};

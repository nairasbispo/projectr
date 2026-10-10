import React from 'react';
import { useApp, NavigationSection } from '../context/AppContext';

export const Navigation: React.FC = () => {
  const { activeSection, setActiveSection, setIsRegisterModalOpen } = useApp();

  const navItems: { id: NavigationSection; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'cefr', label: 'CEFR', icon: 'military_tech' },
    { id: 'grammar', label: 'Grammar', icon: 'spellcheck' },
    { id: 'goals', label: 'Goals', icon: 'flag' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#0a0e17]/95 backdrop-blur-xl border-t border-[#1e293b] shadow-2xl">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-1">
        {/* Dashboard */}
        <button
          onClick={() => setActiveSection('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] flex-1 transition-colors ${
            activeSection === 'dashboard' ? 'text-[#38bdf8] font-semibold' : 'text-[#64748b] hover:text-[#f1f5f9]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: activeSection === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}
          >
            dashboard
          </span>
          <span className="text-[10px] tracking-tight mt-0.5">Dashboard</span>
        </button>

        {/* CEFR */}
        <button
          onClick={() => setActiveSection('cefr')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] flex-1 transition-colors ${
            activeSection === 'cefr' ? 'text-[#38bdf8] font-semibold' : 'text-[#64748b] hover:text-[#f1f5f9]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: activeSection === 'cefr' ? "'FILL' 1" : "'FILL' 0" }}
          >
            military_tech
          </span>
          <span className="text-[10px] tracking-tight mt-0.5">CEFR</span>
        </button>

        {/* Center Floating Action Button: + Registrar */}
        <div className="flex items-center justify-center -mt-6 px-1">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            aria-label="Registrar estudo"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#0284c7] to-[#2563eb] text-white shadow-lg shadow-[#0284c7]/40 active:scale-90 hover:brightness-110 transition-all border border-[#38bdf8]/40"
          >
            <span className="material-symbols-outlined text-[28px] font-bold">add</span>
          </button>
        </div>

        {/* Grammar */}
        <button
          onClick={() => setActiveSection('grammar')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] flex-1 transition-colors ${
            activeSection === 'grammar' ? 'text-[#38bdf8] font-semibold' : 'text-[#64748b] hover:text-[#f1f5f9]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: activeSection === 'grammar' ? "'FILL' 1" : "'FILL' 0" }}
          >
            spellcheck
          </span>
          <span className="text-[10px] tracking-tight mt-0.5">Grammar</span>
        </button>

        {/* Goals */}
        <button
          onClick={() => setActiveSection('goals')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] flex-1 transition-colors ${
            activeSection === 'goals' ? 'text-[#38bdf8] font-semibold' : 'text-[#64748b] hover:text-[#f1f5f9]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: activeSection === 'goals' ? "'FILL' 1" : "'FILL' 0" }}
          >
            flag
          </span>
          <span className="text-[10px] tracking-tight mt-0.5">Goals</span>
        </button>
      </div>
    </nav>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Navigation } from './components/Navigation';
import { HomeScreen } from './screens/HomeScreen';
import { CefrLevelsScreen } from './screens/CefrLevelsScreen';
import { GrammarScreen } from './screens/GrammarScreen';
import { VocabularyScreen } from './screens/VocabularyScreen';
import { GoalsScreen } from './screens/GoalsScreen';
import { ActivitiesScreen } from './screens/ActivitiesScreen';
import { RegisterStudyModal } from './screens/RegisterStudyModal';
import { ActivityDetailsModal } from './components/ActivityDetailsModal';
import { AddVocabularyModal } from './components/AddVocabularyModal';

const AppContent: React.FC = () => {
  const { activeSection, feedbackMessage, setFeedbackMessage } = useApp();

  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage, setFeedbackMessage]);

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#f1f5f9] flex flex-col antialiased selection:bg-[#0284c7] selection:text-white">
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div className="fixed top-20 inset-x-4 z-50 max-w-sm mx-auto bg-[#10b981] text-black font-semibold p-3.5 rounded-2xl shadow-2xl border border-[#34d399]/40 flex items-center justify-between gap-2 animate-bounce">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="text-xs">{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-black/70 hover:text-black"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <Header />

      {/* Lateral Drawer / Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 pt-16 pb-24 overflow-x-hidden">
        {activeSection === 'dashboard' && <HomeScreen />}
        {activeSection === 'cefr' && <CefrLevelsScreen />}
        {activeSection === 'grammar' && <GrammarScreen />}
        {activeSection === 'vocabulary' && <VocabularyScreen />}
        {activeSection === 'goals' && <GoalsScreen />}
        {activeSection === 'activities' && <ActivitiesScreen />}
      </main>

      {/* Fixed Bottom Navigation for Mobile Quick Access */}
      <Navigation />

      {/* Modals */}
      <RegisterStudyModal />
      <ActivityDetailsModal />
      <AddVocabularyModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

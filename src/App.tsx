import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TitleBar } from './components/TitleBar';
import { SectionTodayTasks } from './components/Dashboard/SectionTodayTasks';
import { SectionPendingTasks } from './components/Dashboard/SectionPendingTasks';
import { SectionCurrentFocus } from './components/Dashboard/SectionCurrentFocus';
import { SectionTodaySummary } from './components/Dashboard/SectionTodaySummary';
import { MissionManager } from './components/Missions/MissionManager';
import { HabitTracker } from './components/Habits/HabitTracker';
import { WeeklyStatsView } from './components/Analytics/WeeklyStatsView';
import { SettingsView } from './components/Settings/SettingsView';
import { ProcrastinationBanner } from './components/ProcrastinationBanner';
import { TaskModal } from './components/Modals/TaskModal';
import { SmartPlannerModal } from './components/Modals/SmartPlannerModal';

const MainContent: React.FC = () => {
  const {
    activeTab,
    openNewTaskModal,
    completeActiveTask,
    activeTask,
    isTimerRunning,
    startFocusTimer,
    pauseFocusTimer,
    moveTaskToPending,
    moveTaskToToday,
    settings,
  } = useApp();

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Ctrl + N -> New Task
      if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openNewTaskModal();
      }

      // Ctrl + D -> Complete Active Task
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        completeActiveTask();
      }

      // Ctrl + F -> Search (Focus Search input handled natively or focus search)
      if (e.ctrlKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }

      // Ctrl + P -> Move Active Task to Pending / Today toggle
      if (e.ctrlKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (activeTask) {
          if (activeTask.scheduled_date) {
            moveTaskToPending(activeTask.id);
          } else {
            moveTaskToToday(activeTask.id);
          }
        }
      }

      // Space -> Start/Pause Timer
      if (e.code === 'Space') {
        e.preventDefault();
        if (activeTask) {
          if (isTimerRunning) {
            pauseFocusTimer();
          } else {
            startFocusTimer(activeTask.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openNewTaskModal, completeActiveTask, activeTask, isTimerRunning, pauseFocusTimer, startFocusTimer, moveTaskToPending, moveTaskToToday]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#090D16] text-slate-100">
      {/* TitleBar Frameless Header */}
      <TitleBar />

      {/* Smart Procrastination Notification Banner */}
      <ProcrastinationBanner />

      {/* Main App Body */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'dashboard' && (
          <div className="h-full p-4 overflow-y-auto">
            {settings.widgetMode ? (
              /* Compact Single Column Widget View */
              <div className="space-y-4 max-w-md mx-auto">
                <div className="h-[360px]"><SectionCurrentFocus /></div>
                <div className="h-[420px]"><SectionTodayTasks /></div>
                <div className="h-[320px]"><SectionTodaySummary /></div>
                <div className="h-[380px]"><SectionPendingTasks /></div>
              </div>
            ) : (
              /* Full 4-Section Dashboard Grid Layout */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-[640px]">
                {/* Left Column: Section 1 & Section 2 */}
                <div className="lg:col-span-7 flex flex-col space-y-4 h-full">
                  <div className="flex-1 min-h-[320px]"><SectionTodayTasks /></div>
                  <div className="h-[280px]"><SectionPendingTasks /></div>
                </div>

                {/* Right Column: Section 3 & Section 4 */}
                <div className="lg:col-span-5 flex flex-col space-y-4 h-full">
                  <div className="flex-1 min-h-[320px]"><SectionCurrentFocus /></div>
                  <div className="h-[280px]"><SectionTodaySummary /></div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'missions' && <div className="h-full overflow-y-auto"><MissionManager /></div>}
        {activeTab === 'habits' && <div className="h-full overflow-y-auto"><HabitTracker /></div>}
        {activeTab === 'analytics' && <div className="h-full overflow-y-auto"><WeeklyStatsView /></div>}
        {activeTab === 'settings' && <div className="h-full overflow-y-auto"><SettingsView /></div>}
      </main>

      {/* Modals */}
      <TaskModal />
      <SmartPlannerModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;

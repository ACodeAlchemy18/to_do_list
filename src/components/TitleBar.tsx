import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FiMinus, FiSquare, FiX, FiSearch,
  FiGrid, FiTarget, FiZap, FiBarChart2, FiSettings, FiLayout, FiPlus
} from 'react-icons/fi';
import { BsPinAngle, BsStars } from 'react-icons/bs';

export const TitleBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    settings,
    toggleAlwaysOnTop,
    toggleWidgetMode,
    filter,
    setFilter,
    openNewTaskModal,
    setIsSmartPlannerOpen
  } = useApp();

  return (
    <header className="drag-region flex items-center justify-between px-4 py-2 bg-[#0d1322]/80 border-b border-white/5 backdrop-blur-md select-none text-xs z-50">
      {/* App Branding & Navigation Tabs */}
      <div className="flex items-center space-x-6 no-drag">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <FiZap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-extrabold tracking-wider bg-gradient-to-r from-blue-400 via-indigo-300 to-slate-100 bg-clip-text text-transparent uppercase text-[11px]">
            MISSION CONTROL
          </span>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center space-x-1 bg-white/5 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all text-[11px] font-medium ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <FiGrid className="w-3 h-3" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('missions')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all text-[11px] font-medium ${
              activeTab === 'missions'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <FiTarget className="w-3 h-3" />
            <span>Missions</span>
          </button>

          <button
            onClick={() => setActiveTab('habits')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all text-[11px] font-medium ${
              activeTab === 'habits'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span className="text-[12px]">🔥</span>
            <span>Habits</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all text-[11px] font-medium ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <FiBarChart2 className="w-3 h-3" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all text-[11px] font-medium ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <FiSettings className="w-3 h-3" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Global Instant Search & Quick Action Triggers */}
      <div className="flex items-center space-x-3 no-drag">
        {/* Instant Search Bar */}
        <div className="relative flex items-center">
          <FiSearch className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks, missions, tags... (Ctrl+F)"
            value={filter.searchQuery || ''}
            onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-56 glass-input pl-8 pr-3 py-1 rounded-lg text-xs placeholder:text-slate-500 focus:w-64 transition-all"
          />
        </div>

        {/* AI Planner Button */}
        <button
          onClick={() => setIsSmartPlannerOpen(true)}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-semibold hover:opacity-90 transition-all shadow-md shadow-purple-600/20"
          title="AI Daily Planner"
        >
          <BsStars className="w-3 h-3" />
          <span>AI Planner</span>
        </button>

        {/* Quick New Task */}
        <button
          onClick={() => openNewTaskModal()}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium shadow-md shadow-blue-600/30 transition-all"
          title="New Task (Ctrl+N)"
        >
          <FiPlus className="w-3.5 h-3.5" />
          <span>Task</span>
        </button>

        {/* Window Utility Buttons */}
        <div className="flex items-center space-x-1 pl-2 border-l border-white/10">
          {/* Always on top toggle */}
          <button
            onClick={toggleAlwaysOnTop}
            className={`p-1.5 rounded-md transition-all ${
              settings.alwaysOnTop ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
            title="Always On Top"
          >
            <BsPinAngle className="w-3.5 h-3.5" />
          </button>

          {/* Widget Mode toggle */}
          <button
            onClick={toggleWidgetMode}
            className={`p-1.5 rounded-md transition-all ${
              settings.widgetMode ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
            title="Compact Widget View"
          >
            <FiLayout className="w-3.5 h-3.5" />
          </button>

          {/* Minimize */}
          <button
            onClick={() => window.electronAPI?.minimizeWindow()}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-md transition-all"
            title="Minimize"
          >
            <FiMinus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize */}
          <button
            onClick={() => window.electronAPI?.maximizeWindow()}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-md transition-all"
            title="Maximize"
          >
            <FiSquare className="w-3 h-3" />
          </button>

          {/* Close / Hide to Tray */}
          <button
            onClick={() => window.electronAPI?.closeWindow()}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
            title="Minimize to System Tray"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

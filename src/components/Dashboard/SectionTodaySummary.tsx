import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FiCheckCircle, FiClock, FiList, FiTrendingUp, FiSmile
} from 'react-icons/fi';

export const SectionTodaySummary: React.FC = () => {
  const { tasks } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.scheduled_date === todayStr);

  const completedToday = todayTasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status !== 'completed').length;
  const totalToday = todayTasks.length;

  const totalFocusSeconds = todayTasks.reduce((acc, t) => acc + (t.actual_seconds || 0), 0);
  const hoursFocused = (totalFocusSeconds / 3600).toFixed(1);

  const completionPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const remainingToday = totalToday - completedToday;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between h-full">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>TODAY SUMMARY</span>
        </h2>
        <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
          {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-2.5 my-auto">
        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FiCheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Completed</span>
            <p className="text-base font-extrabold text-slate-100">{completedToday}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <FiList className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Pending</span>
            <p className="text-base font-extrabold text-slate-100">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FiClock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Focus Hours</span>
            <p className="text-base font-extrabold text-slate-100">{hoursFocused}h</p>
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FiTrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Completion %</span>
            <p className="text-base font-extrabold text-slate-100">{completionPercent}%</p>
          </div>
        </div>
      </div>

      {/* Motivation Panel (Fact-based encouragement per specification) */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 p-3 rounded-xl border border-blue-500/20 mt-3 flex items-start space-x-2.5">
        <FiSmile className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-[11px] leading-tight text-slate-300">
          {completedToday > 0 ? (
            <p>
              You've completed <strong className="text-emerald-400 font-bold">{completedToday} task{completedToday > 1 ? 's' : ''}</strong> today and focused for <strong className="text-blue-400 font-bold">{hoursFocused} hours</strong>. {remainingToday > 0 ? `Only ${remainingToday} left!` : "You've crushed all your daily goals!"}
            </p>
          ) : (
            <p>
              Ready to focus? You have <strong className="text-amber-400 font-bold">{totalToday} task{totalToday !== 1 ? 's' : ''}</strong> scheduled for today. Start your first session to build momentum!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

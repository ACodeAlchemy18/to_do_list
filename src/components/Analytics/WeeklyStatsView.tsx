import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  FiBarChart2, FiCheckCircle, FiClock, FiTrendingUp,
  FiAward, FiCalendar, FiTarget, FiFileText
} from 'react-icons/fi';

export const WeeklyStatsView: React.FC = () => {
  const { stats } = useApp();

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        Loading analytics...
      </div>
    );
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxFocusHours = Math.max(1, ...Object.values(stats.dailyFocusHours || {}));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
          <FiBarChart2 className="w-6 h-6 text-blue-400" />
          <span>WEEKLY PRODUCTIVITY DASHBOARD</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Empirical focus metrics & automatic productivity review
        </p>
      </div>

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -2 }} className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FiCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Tasks Completed</span>
            <p className="text-xl font-extrabold text-slate-100">{stats.tasksCompleted}</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FiClock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Hours Focused</span>
            <p className="text-xl font-extrabold text-slate-100">{stats.hoursFocused}h</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FiTrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Completion %</span>
            <p className="text-xl font-extrabold text-slate-100">{stats.completionRate}%</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <FiCalendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Most Productive Day</span>
            <p className="text-xl font-extrabold text-slate-100">{stats.mostProductiveDay}</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FiTarget className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Top Mission</span>
            <p className="text-sm font-bold text-slate-100 truncate max-w-[140px]">{stats.mostProductiveMission}</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <FiAward className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Avg Completion Time</span>
            <p className="text-xl font-extrabold text-slate-100">{stats.avgCompletionTimeMinutes}m</p>
          </div>
        </motion.div>
      </div>

      {/* Daily Focus Hours Bar Chart */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10">
        <h3 className="text-sm font-bold text-slate-200 mb-4">Daily Focus Time Distribution</h3>
        <div className="flex items-end justify-between h-48 pt-6 px-4 pb-2 border-b border-white/10">
          {days.map(day => {
            const hours = stats.dailyFocusHours?.[day] || 0;
            const barHeight = Math.max(10, Math.round((hours / maxFocusHours) * 100));

            return (
              <div key={day} className="flex flex-col items-center flex-1 space-y-2">
                <span className="text-[10px] font-mono text-blue-400 font-bold">{hours > 0 ? `${hours.toFixed(1)}h` : '-'}</span>
                <div className="w-8 bg-slate-800 rounded-t-lg overflow-hidden h-32 flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${barHeight}%` }}
                    transition={{ duration: 0.6 }}
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-lg shadow-lg shadow-blue-500/30"
                  />
                </div>
                <span className="text-xs font-semibold text-slate-400">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Automated Weekly Review Summary Report */}
      <div className="glass-panel rounded-2xl p-5 border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900">
        <div className="flex items-center space-x-2 mb-3">
          <FiFileText className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-extrabold text-slate-100">Automated Weekly Executive Review</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Over the past week, you completed <strong className="text-emerald-400 font-bold">{stats.tasksCompleted} tasks</strong> and logged <strong className="text-blue-400 font-bold">{stats.hoursFocused} focus hours</strong>. Your peak efficiency occurred on <strong className="text-amber-400 font-bold">{stats.mostProductiveDay}</strong>, with primary efforts directed towards <strong className="text-purple-400 font-bold">{stats.mostProductiveMission}</strong>. Keep maintaining consistent daily habit check-ins to prevent procrastination bottlenecks!
        </p>
      </div>
    </div>
  );
};

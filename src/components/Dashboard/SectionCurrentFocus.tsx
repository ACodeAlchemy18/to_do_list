import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  FiPlay, FiPause, FiCheckCircle, FiClock,
  FiZap, FiMinimize2, FiCoffee
} from 'react-icons/fi';

export const SectionCurrentFocus: React.FC = () => {
  const {
    activeTask,
    isTimerRunning,
    timerSeconds,
    pomodoroMode,
    pomodoroTimeLeft,
    pomodoroIsBreak,
    startFocusTimer,
    pauseFocusTimer,
    completeActiveTask,
    togglePomodoroMode,
    missions,
    tasks,
  } = useApp();

  const activeMission = activeTask ? missions.find(m => m.id === activeTask.mission_id) : null;

  // Format main elapsed timer
  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  };

  const { hours, minutes, seconds } = formatTimer(
    pomodoroMode ? pomodoroTimeLeft : timerSeconds
  );

  return (
    <div className="glass-panel rounded-2xl p-5 border border-blue-500/30 flex flex-col justify-between h-full bg-gradient-to-b from-blue-950/20 via-slate-900/40 to-slate-950/80 shadow-2xl shadow-blue-500/10 relative overflow-hidden">
      {/* Glow Aura Background */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl transition-opacity duration-1000 pointer-events-none ${isTimerRunning ? 'bg-blue-500/20 opacity-100' : 'bg-slate-700/10 opacity-30'}`} />

      {/* Header Banner */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isTimerRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          <h2 className="text-xs font-extrabold tracking-widest text-blue-400 uppercase">
            NOW WORKING ON
          </h2>
        </div>

        {/* Pomodoro Mode Toggle */}
        <button
          onClick={togglePomodoroMode}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
            pomodoroMode
              ? 'bg-purple-600/30 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20'
              : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
          }`}
        >
          {pomodoroIsBreak ? <FiCoffee className="w-3 h-3 text-amber-400" /> : <FiClock className="w-3 h-3" />}
          <span>{pomodoroMode ? (pomodoroIsBreak ? 'Break Mode (5m)' : 'Pomodoro (25m)') : 'Stopwatch'}</span>
        </button>
      </div>

      {/* Main Focus Content */}
      <div className="my-auto py-4 text-center z-10 flex flex-col items-center justify-center">
        {activeTask ? (
          <>
            {/* Active Task Info */}
            <motion.div
              key={activeTask.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-3 max-w-sm"
            >
              <h3 className="text-lg font-extrabold text-slate-100 leading-tight">
                {activeTask.title}
              </h3>
              {activeMission && (
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-slate-300 mt-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeMission.color }} />
                  <span>{activeMission.title}</span>
                </div>
              )}
            </motion.div>

            {/* Glowing Large Digital Timer Display */}
            <div className="my-4 font-mono font-black text-5xl tracking-tight text-slate-100 flex items-center justify-center space-x-1 drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]">
              <span className="bg-slate-900/80 px-3 py-2 rounded-xl border border-white/10">{hours}</span>
              <span className="text-blue-500 animate-pulse">:</span>
              <span className="bg-slate-900/80 px-3 py-2 rounded-xl border border-white/10">{minutes}</span>
              <span className="text-blue-500 animate-pulse">:</span>
              <span className="bg-slate-900/80 px-3 py-2 rounded-xl border border-white/10">{seconds}</span>
            </div>

            {/* Focus Controls */}
            <div className="flex items-center space-x-3 mt-4">
              {isTimerRunning ? (
                <button
                  onClick={pauseFocusTimer}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 transition-all transform hover:scale-105"
                >
                  <FiPause className="w-4 h-4" />
                  <span>Pause Timer</span>
                </button>
              ) : (
                <button
                  onClick={() => startFocusTimer(activeTask.id)}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/40 transition-all transform hover:scale-105"
                >
                  <FiPlay className="w-4 h-4 fill-current" />
                  <span>Resume Focus</span>
                </button>
              )}

              <button
                onClick={completeActiveTask}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all transform hover:scale-105"
              >
                <FiCheckCircle className="w-4 h-4" />
                <span>Complete Task</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
              <FiZap className="w-7 h-7 text-blue-400 animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">No Active Focus Task</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Select a task from Today's Tasks and click "Start" to eliminate distractions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

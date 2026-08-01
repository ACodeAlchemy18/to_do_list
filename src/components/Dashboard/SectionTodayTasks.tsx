import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Task, Priority, TaskStatus } from '../../types';
import {
  FiPlay, FiPause, FiCheckCircle, FiTrash2, FiEdit3,
  FiClock, FiArrowRight, FiCheck, FiAlertCircle, FiPlus
} from 'react-icons/fi';

export const SectionTodayTasks: React.FC = () => {
  const {
    tasks,
    missions,
    startFocusTimer,
    pauseFocusTimer,
    completeActiveTask,
    updateTaskStatus,
    deleteTask,
    moveTaskToPending,
    openEditTaskModal,
    openNewTaskModal,
    activeTask,
    isTimerRunning,
    filter,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter tasks scheduled for today
  let todayTasks = tasks.filter(t => t.scheduled_date === todayStr);

  // Apply search/priority filters if active
  if (filter.searchQuery) {
    const q = filter.searchQuery.toLowerCase();
    todayTasks = todayTasks.filter(
      t => t.title.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }
  if (filter.priority && filter.priority !== 'all') {
    todayTasks = todayTasks.filter(t => t.priority === filter.priority);
  }
  if (filter.missionId && filter.missionId !== 'all') {
    todayTasks = todayTasks.filter(t => t.mission_id === filter.missionId);
  }

  const completedCount = todayTasks.filter(t => t.status === 'completed').length;
  const totalCount = todayTasks.length;
  const remainingCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">MED</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">LOW</span>;
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'working':
        return <span className="flex items-center space-x-1 text-blue-400 font-semibold text-[10px]"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" /><span>Working</span></span>;
      case 'completed':
        return <span className="text-emerald-400 font-medium text-[10px]">Completed</span>;
      case 'blocked':
        return <span className="text-amber-400 font-medium text-[10px]">Blocked</span>;
      default:
        return <span className="text-slate-400 font-medium text-[10px]">Not Started</span>;
    }
  };

  const formatSeconds = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col h-full">
      {/* Header & Section Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span>TODAY'S TASKS</span>
          </h2>
          <p className="text-xs text-slate-400">Essential focus items scheduled for today</p>
        </div>

        <button
          onClick={() => openNewTaskModal()}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold border border-blue-500/30 transition-all"
        >
          <FiPlus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Progress Bar & Stats */}
      <div className="bg-slate-900/60 rounded-xl p-3.5 border border-white/5 mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-300">Today's Progress</span>
          <span className="font-extrabold text-blue-400">{progressPercent}%</span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 h-full rounded-full shadow-lg shadow-blue-500/40"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] mt-2.5 text-slate-400 pt-2 border-t border-white/5">
          <div>
            <span>Completed: </span>
            <strong className="text-emerald-400 font-bold">{completedCount}</strong>
          </div>
          <div>
            <span>Remaining: </span>
            <strong className="text-slate-200 font-bold">{remainingCount}</strong>
          </div>
          <div>
            <span>Total Tasks: </span>
            <strong className="text-blue-400 font-bold">{totalCount}</strong>
          </div>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {todayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-white/5 rounded-2xl p-6">
            <FiCheckCircle className="w-10 h-10 text-slate-600 mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-300">No tasks scheduled for today</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Drag tasks from Pending below or click "Add Task" to populate your focus list.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {todayTasks.map((task) => {
              const mission = missions.find(m => m.id === task.mission_id);
              const isActive = activeTask?.id === task.id;
              const isDone = task.status === 'completed';

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`glass-card rounded-xl p-3.5 border transition-all ${
                    isActive
                      ? 'border-blue-500/60 bg-blue-950/30 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40'
                      : isDone
                      ? 'border-emerald-500/20 bg-emerald-950/10 opacity-75'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Complete Checkbox Toggle */}
                      <button
                        onClick={() => {
                          if (isDone) {
                            updateTaskStatus(task.id, 'not_started');
                          } else {
                            if (isActive) {
                              completeActiveTask();
                            } else {
                              updateTaskStatus(task.id, 'completed');
                            }
                          }
                        }}
                        className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                            : 'border-white/20 hover:border-blue-400 hover:bg-blue-500/10'
                        }`}
                      >
                        {isDone && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h3 className={`font-semibold text-xs leading-snug ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                            {task.title}
                          </h3>
                          {getPriorityBadge(task.priority)}
                          {getStatusBadge(task.status)}
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        {/* Meta Tags & Mission */}
                        <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-400">
                          {mission && (
                            <span className="flex items-center space-x-1 font-medium px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mission.color }} />
                              <span>{mission.title}</span>
                            </span>
                          )}

                          <span className="flex items-center space-x-1">
                            <FiClock className="w-3 h-3 text-slate-500" />
                            <span>Est: {task.estimated_minutes}m</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-blue-400 font-mono">Actual: {formatSeconds(task.actual_seconds)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Control Buttons */}
                    <div className="flex items-center space-x-1 ml-3">
                      {!isDone && (
                        isActive && isTimerRunning ? (
                          <button
                            onClick={() => pauseFocusTimer()}
                            className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-all"
                            title="Pause Focus Timer"
                          >
                            <FiPause className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => startFocusTimer(task.id)}
                            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all"
                            title="Start Focus Timer"
                          >
                            <FiPlay className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}

                      <button
                        onClick={() => openEditTaskModal(task)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-all"
                        title="Edit Task"
                      >
                        <FiEdit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => moveTaskToPending(task.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all"
                        title="Move to Pending"
                      >
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete Task"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

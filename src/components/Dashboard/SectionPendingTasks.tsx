import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Priority, TaskStatus } from '../../types';
import {
  FiCalendar, FiPlus, FiArrowUp, FiTrash2,
  FiEdit3, FiAlertCircle, FiClock
} from 'react-icons/fi';

export const SectionPendingTasks: React.FC = () => {
  const {
    tasks,
    missions,
    moveTaskToToday,
    deleteTask,
    openEditTaskModal,
    openNewTaskModal,
    filter,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Pending tasks: not scheduled for today OR has due date
  let pendingTasks = tasks.filter(t => t.scheduled_date !== todayStr && t.status !== 'completed');

  if (filter.searchQuery) {
    const q = filter.searchQuery.toLowerCase();
    pendingTasks = pendingTasks.filter(
      t => t.title.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }
  if (filter.priority && filter.priority !== 'all') {
    pendingTasks = pendingTasks.filter(t => t.priority === filter.priority);
  }
  if (filter.missionId && filter.missionId !== 'all') {
    pendingTasks = pendingTasks.filter(t => t.mission_id === filter.missionId);
  }

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

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col h-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>PENDING TASKS</span>
          </h2>
          <p className="text-xs text-slate-400">Backlogged & upcoming tasks ready to schedule</p>
        </div>

        <button
          onClick={() => openNewTaskModal()}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all"
        >
          <FiPlus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {pendingTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-white/5 rounded-2xl p-6">
            <FiClock className="w-10 h-10 text-slate-600 mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-300">No pending tasks</p>
            <p className="text-xs text-slate-500 mt-1">All upcoming items have been scheduled or completed!</p>
          </div>
        ) : (
          <AnimatePresence>
            {pendingTasks.map((task) => {
              const mission = missions.find(m => m.id === task.mission_id);
              const isOverdue = task.due_date && task.due_date < todayStr;

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`glass-card rounded-xl p-3.5 border transition-all ${
                    isOverdue
                      ? 'border-red-500/50 bg-red-950/20 ring-1 ring-red-500/30'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="font-semibold text-xs text-slate-100 leading-snug">
                          {task.title}
                        </h3>
                        {getPriorityBadge(task.priority)}
                        {isOverdue && (
                          <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                            <FiAlertCircle className="w-3 h-3" />
                            <span>OVERDUE</span>
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      {/* Meta Information */}
                      <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-400">
                        {mission && (
                          <span className="flex items-center space-x-1 font-medium px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mission.color }} />
                            <span>{mission.title}</span>
                          </span>
                        )}

                        {task.due_date && (
                          <span className={`flex items-center space-x-1 ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                            <FiCalendar className="w-3 h-3" />
                            <span>Due: {task.due_date}</span>
                          </span>
                        )}

                        <span className="text-slate-500">Est: {task.estimated_minutes}m</span>
                      </div>
                    </div>

                    {/* Quick Move to Today Button */}
                    <div className="flex items-center space-x-1.5 ml-3">
                      <button
                        onClick={() => moveTaskToToday(task.id)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-medium transition-all shadow-sm"
                        title="Move directly into Today's Tasks"
                      >
                        <FiArrowUp className="w-3.5 h-3.5" />
                        <span>Today</span>
                      </button>

                      <button
                        onClick={() => openEditTaskModal(task)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-all"
                        title="Edit Task"
                      >
                        <FiEdit3 className="w-3.5 h-3.5" />
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

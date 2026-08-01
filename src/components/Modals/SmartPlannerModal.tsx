import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { FiX, FiCheck, FiArrowUp, FiZap } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

export const SmartPlannerModal: React.FC = () => {
  const { isSmartPlannerOpen, setIsSmartPlannerOpen, tasks, moveTaskToToday } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Pick pending tasks that are high priority or overdue or upcoming
  const pendingTasks = tasks.filter(t => t.scheduled_date !== todayStr && t.status !== 'completed');

  // Smart recommendation algorithm: Sort high priority first, then due date
  const recommendedTasks = [...pendingTasks].sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;
    return 0;
  }).slice(0, 4);

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  if (!isSmartPlannerOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const applyRecommendations = async () => {
    const idsToMove = selectedTaskIds.length > 0 ? selectedTaskIds : recommendedTasks.map(t => t.id);
    for (const id of idsToMove) {
      await moveTaskToToday(id);
    }
    setIsSmartPlannerOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel rounded-2xl border border-purple-500/30 w-full max-w-lg bg-slate-900 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-950/40">
          <div className="flex items-center space-x-2">
            <BsStars className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-extrabold text-slate-100">AI Daily Planner Suggestions</h2>
          </div>
          <button
            onClick={() => setIsSmartPlannerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-all"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Based on priority weightings, due dates, and mission velocity, AI recommends scheduling these high-impact tasks for Today:
          </p>

          {recommendedTasks.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No pending tasks available for recommendation right now!
            </div>
          ) : (
            <div className="space-y-2.5">
              {recommendedTasks.map(task => {
                const isSelected = selectedTaskIds.includes(task.id);
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleSelect(task.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-purple-500/60 bg-purple-950/30 ring-1 ring-purple-500/40'
                        : 'border-white/10 bg-slate-900/60 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-slate-100">{task.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Est: {task.estimated_minutes} mins</p>
                    </div>

                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isSelected ? 'bg-purple-600 border-purple-400 text-white' : 'border-white/20'}`}>
                      {isSelected && <FiCheck className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-[11px] text-slate-400">
              {selectedTaskIds.length > 0 ? `${selectedTaskIds.length} tasks selected` : 'Select tasks or click Apply All'}
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSmartPlannerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={applyRecommendations}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all flex items-center space-x-1.5"
              >
                <FiZap className="w-4 h-4" />
                <span>Move to Today</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

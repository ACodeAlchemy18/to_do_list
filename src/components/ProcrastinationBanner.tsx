import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FiAlertTriangle, FiX, FiPause, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export const ProcrastinationBanner: React.FC = () => {
  const {
    procrastinationWarning,
    dismissProcrastinationWarning,
    activeTask,
    pauseFocusTimer,
    completeActiveTask,
    moveTaskToPending,
  } = useApp();

  if (!procrastinationWarning || !activeTask) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white px-4 py-2.5 shadow-2xl flex items-center justify-between text-xs z-50 border-b border-amber-400/30"
      >
        <div className="flex items-center space-x-2.5">
          <FiAlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce" />
          <span className="font-semibold">{procrastinationWarning}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => completeActiveTask()}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-all"
          >
            <FiCheckCircle className="w-3.5 h-3.5" />
            <span>Finish It</span>
          </button>

          <button
            onClick={() => pauseFocusTimer()}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-slate-100 font-bold transition-all"
          >
            <FiPause className="w-3.5 h-3.5" />
            <span>Pause It</span>
          </button>

          <button
            onClick={() => {
              pauseFocusTimer();
              moveTaskToPending(activeTask.id);
            }}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-slate-100 font-bold transition-all"
          >
            <FiArrowRight className="w-3.5 h-3.5" />
            <span>Move to Pending</span>
          </button>

          <button
            onClick={dismissProcrastinationWarning}
            className="p-1 text-white/80 hover:text-white rounded-md"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

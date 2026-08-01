import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Mission } from '../../types';
import { FiPlus, FiTarget, FiTrash2, FiFolder, FiCheckCircle } from 'react-icons/fi';

export const MissionManager: React.FC = () => {
  const { missions, tasks, createMission, deleteMission, openNewTaskModal, setFilter } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('target');

  const presetColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#06B6D4'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createMission(title, description, color, icon);
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <FiTarget className="w-6 h-6 text-blue-400" />
            <span>MISSIONS CONTROL</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Group tasks into overarching high-impact Missions to track long-term progress.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all"
        >
          <FiPlus className="w-4 h-4" />
          <span>New Mission</span>
        </button>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {missions.map((mission) => {
          const missionTasks = tasks.filter(t => t.mission_id === mission.id);
          const completedCount = missionTasks.filter(t => t.status === 'completed').length;
          const totalCount = missionTasks.length;
          const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <motion.div
              key={mission.id}
              whileHover={{ y: -3 }}
              className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden flex flex-col justify-between"
            >
              {/* Top Bar Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: mission.color }} />

              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                      style={{ backgroundColor: `${mission.color}30`, borderColor: mission.color, borderWidth: 1 }}
                    >
                      <FiFolder className="w-5 h-5" style={{ color: mission.color }} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-100">{mission.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{mission.description || 'No description provided'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteMission(mission.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete Mission"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Stats */}
                <div className="mt-5 bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-300">Mission Progress</span>
                    <span className="text-slate-100 font-mono font-bold">{completedCount} / {totalCount} Tasks ({percent}%)</span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full shadow-md"
                      style={{ backgroundColor: mission.color }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <button
                  onClick={() => {
                    setFilter(prev => ({ ...prev, missionId: mission.id }));
                  }}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-all flex items-center space-x-1"
                >
                  <span>Filter Dashboard Tasks</span>
                </button>

                <button
                  onClick={() => openNewTaskModal(mission.id)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 transition-all"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* New Mission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel rounded-2xl p-6 border border-white/15 w-full max-w-md bg-slate-900 shadow-2xl"
          >
            <h2 className="text-base font-bold text-slate-100 mb-4">Create New Mission</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mission Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java Learning, LLM Fine Tuning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of this mission's objective..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Accent Color</label>
                <div className="flex items-center space-x-3">
                  {presetColors.map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'scale-125 border-white shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all"
                >
                  Save Mission
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

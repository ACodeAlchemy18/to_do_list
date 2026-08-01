import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { FiPlus, FiCheck, FiZap, FiAward } from 'react-icons/fi';

export const HabitTracker: React.FC = () => {
  const { habits, createHabit, toggleHabit } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#06B6D4');

  const presetColors = ['#06B6D4', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createHabit(title, 'fire', color);
    setTitle('');
    setIsModalOpen(false);
  };

  const highestStreak = habits.reduce((max, h) => Math.max(max, h.streak_count), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Banner & Global Streak Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <span className="text-2xl">🔥</span>
            <span>HABIT & STREAK TRACKER</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Build consistency through daily micro-habits and unshakeable streaks.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Active Highest Streak Badge */}
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 shadow-md">
            <FiAward className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-extrabold font-mono">🔥 {highestStreak} Day Best Streak</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all"
          >
            <FiPlus className="w-4 h-4" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {habits.map((habit) => {
          const isDoneToday = habit.completed_today;

          return (
            <motion.div
              key={habit.id}
              whileHover={{ y: -3 }}
              className={`glass-panel rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
                isDoneToday
                  ? 'border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">🔥</span>
                  <div className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
                    {habit.streak_count} Days
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-slate-100">{habit.title}</h3>
                <p className="text-xs text-slate-400 mt-1">Best streak: {habit.best_streak} days</p>
              </div>

              {/* Check-in Trigger Button */}
              <button
                onClick={() => toggleHabit(habit.id)}
                className={`w-full mt-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md ${
                  isDoneToday
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                }`}
              >
                {isDoneToday ? (
                  <>
                    <FiCheck className="w-4 h-4 stroke-[3]" />
                    <span>Completed Today!</span>
                  </>
                ) : (
                  <>
                    <FiZap className="w-4 h-4 text-amber-400" />
                    <span>Check-in Today</span>
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* New Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel rounded-2xl p-6 border border-white/15 w-full max-w-md bg-slate-900 shadow-2xl"
          >
            <h2 className="text-base font-bold text-slate-100 mb-4">Create New Daily Habit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Habit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drink Water, Exercise, Meditation, Reading"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  Save Habit
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

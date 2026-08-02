import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { FiPlus, FiCheck, FiZap, FiAward, FiTrash2, FiCalendar } from 'react-icons/fi';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DAY_LABELS: Record<number, string> = {
  0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat',
};

export const HabitTracker: React.FC = () => {
  const { habits, createHabit, toggleHabit, deleteHabit } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#06B6D4');
  const [targetDays, setTargetDays] = useState<string[]>([...ALL_DAYS]); // default: every day

  const presetColors = ['#06B6D4', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  const todayLabel = DAY_LABELS[new Date().getDay()];

  const toggleDay = (day: string) => {
    setTargetDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const days = targetDays.length === 0 ? [...ALL_DAYS] : targetDays;
    await createHabit(title, 'fire', color, days);
    setTitle('');
    setColor('#06B6D4');
    setTargetDays([...ALL_DAYS]);
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async (id: string) => {
    await deleteHabit(id);
    setConfirmDeleteId(null);
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
        <AnimatePresence>
          {habits.map((habit) => {
            const isDoneToday = habit.completed_today;
            const days = habit.target_days && habit.target_days.length > 0 ? habit.target_days : ALL_DAYS;
            const isTargetDay = days.includes(todayLabel);
            const isEveryDay = days.length === 7;

            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -3 }}
                className={`glass-panel rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
                  isDoneToday
                    ? 'border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                    : !isTargetDay
                    ? 'border-white/5 opacity-60'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">🔥</span>
                    <div className="flex items-center space-x-1.5">
                      <div className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
                        {habit.streak_count} Days
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={() => setConfirmDeleteId(habit.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                        title="Delete habit"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-100">{habit.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">Best streak: {habit.best_streak} days</p>

                  {/* Target Days Row */}
                  <div className="flex items-center space-x-1 mt-3">
                    <FiCalendar className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    <div className="flex space-x-0.5">
                      {ALL_DAYS.map(d => (
                        <span
                          key={d}
                          className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                            days.includes(d)
                              ? d === todayLabel
                                ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40'
                                : 'bg-white/8 text-slate-300'
                              : 'text-slate-600'
                          }`}
                        >
                          {d[0]}
                        </span>
                      ))}
                    </div>
                    {isEveryDay && (
                      <span className="text-[9px] text-slate-500 ml-1">Every day</span>
                    )}
                  </div>
                </div>

                {/* Check-in Trigger Button */}
                {isTargetDay ? (
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
                ) : (
                  <div className="w-full mt-5 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 bg-white/3 text-slate-600 border border-white/5 cursor-default select-none">
                    <span>Not scheduled today</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {habits.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/5 rounded-2xl">
            <span className="text-4xl mb-3">🌱</span>
            <p className="text-sm font-semibold text-slate-300">No habits yet</p>
            <p className="text-xs text-slate-500 mt-1">Click "New Habit" to start building your streaks.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel rounded-2xl p-6 border border-red-500/30 w-full max-w-sm bg-slate-900 shadow-2xl"
            >
              <h2 className="text-base font-bold text-slate-100 mb-2">Delete Habit?</h2>
              <p className="text-xs text-slate-400 mb-5">
                This will permanently remove the habit and all its streak history. This cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteConfirm(confirmDeleteId)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Habit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
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

                {/* Target Days Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-slate-300">Target Days</label>
                    <div className="flex space-x-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setTargetDays([...ALL_DAYS])}
                        className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                      >
                        All
                      </button>
                      <span className="text-slate-600">|</span>
                      <button
                        type="button"
                        onClick={() => setTargetDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
                      >
                        Weekdays
                      </button>
                      <span className="text-slate-600">|</span>
                      <button
                        type="button"
                        onClick={() => setTargetDays(['Sat', 'Sun'])}
                        className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
                      >
                        Weekends
                      </button>
                    </div>
                  </div>
                  <div className="flex space-x-1.5">
                    {ALL_DAYS.map(day => (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all border ${
                          targetDays.includes(day)
                            ? 'bg-blue-600/30 border-blue-500/60 text-blue-300 shadow-sm shadow-blue-500/20'
                            : 'bg-white/3 border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/20'
                        }`}
                      >
                        {day[0]}
                        <span className="hidden sm:inline">{day.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    {targetDays.length === 0
                      ? '⚠️ Select at least one day'
                      : targetDays.length === 7
                      ? 'Every day'
                      : `${targetDays.length} day${targetDays.length > 1 ? 's' : ''} per week`}
                  </p>
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
                    disabled={targetDays.length === 0}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-blue-600/30 transition-all"
                  >
                    Save Habit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

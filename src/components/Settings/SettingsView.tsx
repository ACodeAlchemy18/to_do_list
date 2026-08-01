import React from 'react';
import { useApp } from '../../context/AppContext';
import { FiSettings, FiMoon, FiSun, FiBell, FiClock, FiType, FiLayout, FiPower } from 'react-icons/fi';
import { BsPinAngle } from 'react-icons/bs';

export const SettingsView: React.FC = () => {
  const { settings, updateSetting, toggleAlwaysOnTop, toggleWidgetMode } = useApp();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
          <FiSettings className="w-6 h-6 text-blue-400" />
          <span>APPLICATION SETTINGS</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure window behaviors, theme aesthetics, and notifications
        </p>
      </div>

      <div className="space-y-3">
        {/* Always On Top */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <BsPinAngle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-100">Always On Top</h3>
              <p className="text-[11px] text-slate-400">Keep Mission Control widget floating above all other windows</p>
            </div>
          </div>
          <button
            onClick={toggleAlwaysOnTop}
            className={`w-12 h-6 rounded-full transition-colors relative border ${settings.alwaysOnTop ? 'bg-blue-600 border-blue-400' : 'bg-slate-800 border-white/10'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform transform ${settings.alwaysOnTop ? 'translate-x-6' : 'translate-x-1'} top-1 absolute`} />
          </button>
        </div>

        {/* Start with Windows */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FiPower className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-100">Start with Windows</h3>
              <p className="text-[11px] text-slate-400">Automatically launch Mission Control when your computer boots</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('autoStart', !settings.autoStart)}
            className={`w-12 h-6 rounded-full transition-colors relative border ${settings.autoStart ? 'bg-blue-600 border-blue-400' : 'bg-slate-800 border-white/10'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform transform ${settings.autoStart ? 'translate-x-6' : 'translate-x-1'} top-1 absolute`} />
          </button>
        </div>

        {/* Notifications */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FiBell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-100">Desktop Notifications</h3>
              <p className="text-[11px] text-slate-400">Receive alerts for task due dates, Pomodoro sessions, and daily reviews</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative border ${settings.notificationsEnabled ? 'bg-blue-600 border-blue-400' : 'bg-slate-800 border-white/10'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform transform ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'} top-1 absolute`} />
          </button>
        </div>

        {/* Daily Review Reminder Time */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FiClock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-100">Daily Review Reminder Time</h3>
              <p className="text-[11px] text-slate-400">Time to send evening productivity review notification</p>
            </div>
          </div>
          <input
            type="time"
            value={settings.dailyReminderTime}
            onChange={(e) => updateSetting('dailyReminderTime', e.target.value)}
            className="glass-input px-3 py-1.5 rounded-xl text-xs bg-slate-900 text-slate-100"
          />
        </div>

        {/* Pomodoro Timer Configuration */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FiClock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-100">Pomodoro Duration (Minutes)</h3>
              <p className="text-[11px] text-slate-400">Focus sprint duration before break</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="5"
              max="60"
              value={settings.pomodoroLength}
              onChange={(e) => updateSetting('pomodoroLength', Number(e.target.value))}
              className="w-20 glass-input px-3 py-1.5 rounded-xl text-xs text-center"
            />
            <span className="text-xs text-slate-400 font-semibold">mins</span>
          </div>
        </div>
      </div>
    </div>
  );
};

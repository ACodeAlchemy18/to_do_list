/**
 * localStorageService.ts
 *
 * A browser-compatible drop-in replacement for window.electronAPI.
 * All data is persisted in localStorage so the app works fully on Vercel / any browser.
 */

import {
  Task,
  Mission,
  Habit,
  HabitLog,
  FocusSession,
  Settings,
  WeeklyStats,
} from '../types';

// ─── Storage Keys ────────────────────────────────────────────────────────────
const KEYS = {
  TASKS: 'app_tasks',
  MISSIONS: 'app_missions',
  HABITS: 'app_habits',
  HABIT_LOGS: 'app_habit_logs',
  FOCUS_SESSIONS: 'app_focus_sessions',
  SETTINGS: 'app_settings',
  LAST_RESET_DATE: 'app_last_reset_date',
};

// ─── Generic Helpers ─────────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

const todayStr = () => new Date().toISOString().split('T')[0];

// ─── Default Settings ────────────────────────────────────────────────────────
const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  alwaysOnTop: false,
  autoStart: false,
  notificationsEnabled: true,
  dailyReminderTime: '21:00',
  fontSize: 'base',
  widgetMode: false,
  pomodoroLength: 25,
  breakLength: 5,
};

// ─── Task Operations ──────────────────────────────────────────────────────────
export function getTasks(): Task[] {
  return load<Task[]>(KEYS.TASKS, []);
}

export function createTask(task: Task): Task {
  const tasks = getTasks();
  tasks.unshift(task);
  save(KEYS.TASKS, tasks);
  return task;
}

export function updateTask(task: Task): Task {
  const tasks = getTasks().map(t => (t.id === task.id ? task : t));
  save(KEYS.TASKS, tasks);
  return task;
}

export function deleteTask(id: string): void {
  const tasks = getTasks().filter(t => t.id !== id);
  save(KEYS.TASKS, tasks);
}

// ─── Mission Operations ───────────────────────────────────────────────────────
export function getMissions(): Mission[] {
  return load<Mission[]>(KEYS.MISSIONS, []);
}

export function createMission(mission: Mission): Mission {
  const missions = getMissions();
  missions.unshift(mission);
  save(KEYS.MISSIONS, missions);
  return mission;
}

export function deleteMission(id: string): void {
  const missions = getMissions().filter(m => m.id !== id);
  save(KEYS.MISSIONS, missions);
  // Also clear mission_id from any tasks belonging to this mission
  const tasks = getTasks().map(t =>
    t.mission_id === id ? { ...t, mission_id: null } : t
  );
  save(KEYS.TASKS, tasks);
}

// ─── Habit Operations ─────────────────────────────────────────────────────────
export function getHabits(): Habit[] {
  const habits = load<Habit[]>(KEYS.HABITS, []);
  const logs = load<HabitLog[]>(KEYS.HABIT_LOGS, []);
  const today = todayStr();

  return habits.map(h => ({
    ...h,
    completed_today: logs.some(
      l => l.habit_id === h.id && l.completed_date === today
    ),
  }));
}

export function createHabit(habit: Habit): Habit {
  const habits = load<Habit[]>(KEYS.HABITS, []);
  habits.unshift(habit);
  save(KEYS.HABITS, habits);
  return habit;
}

export function deleteHabit(id: string): void {
  const habits = load<Habit[]>(KEYS.HABITS, []).filter(h => h.id !== id);
  save(KEYS.HABITS, habits);
  // Also remove all logs for this habit
  const logs = load<HabitLog[]>(KEYS.HABIT_LOGS, []).filter(l => l.habit_id !== id);
  save(KEYS.HABIT_LOGS, logs);
}

export function toggleHabitToday(id: string): { completed: boolean } {
  const logs = load<HabitLog[]>(KEYS.HABIT_LOGS, []);
  const habits = load<Habit[]>(KEYS.HABITS, []);
  const today = todayStr();

  const alreadyDone = logs.some(
    l => l.habit_id === id && l.completed_date === today
  );

  if (alreadyDone) {
    // Un-toggle: remove today's log & decrement streak
    const newLogs = logs.filter(
      l => !(l.habit_id === id && l.completed_date === today)
    );
    save(KEYS.HABIT_LOGS, newLogs);

    const newHabits = habits.map(h => {
      if (h.id !== id) return h;
      return {
        ...h,
        streak_count: Math.max(0, h.streak_count - 1),
        last_completed_date: null,
      };
    });
    save(KEYS.HABITS, newHabits);
    return { completed: false };
  } else {
    // Toggle on: add log & increment streak
    const newLog: HabitLog = {
      id: `hl_${Date.now()}`,
      habit_id: id,
      completed_date: today,
    };
    logs.push(newLog);
    save(KEYS.HABIT_LOGS, logs);

    const newHabits = habits.map(h => {
      if (h.id !== id) return h;
      const newStreak = h.streak_count + 1;
      return {
        ...h,
        streak_count: newStreak,
        best_streak: Math.max(h.best_streak, newStreak),
        last_completed_date: today,
      };
    });
    save(KEYS.HABITS, newHabits);
    return { completed: true };
  }
}

// ─── Focus Sessions ───────────────────────────────────────────────────────────
export function addFocusSession(session: FocusSession): void {
  const sessions = load<FocusSession[]>(KEYS.FOCUS_SESSIONS, []);
  sessions.push(session);
  save(KEYS.FOCUS_SESSIONS, sessions);
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export function getSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...load<Partial<Settings>>(KEYS.SETTINGS, {}) };
}

export function updateSetting(key: keyof Settings, value: any): Settings {
  const current = getSettings();
  const updated = { ...current, [key]: value };
  save(KEYS.SETTINGS, updated);
  return updated;
}

// ─── Weekly Stats (computed) ──────────────────────────────────────────────────
export function getWeeklyStats(): WeeklyStats {
  const tasks = getTasks();
  const sessions = load<FocusSession[]>(KEYS.FOCUS_SESSIONS, []);
  const missions = getMissions();

  // Build the date range: last 7 days
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];

  // Tasks completed in the past 7 days
  const recentCompleted = tasks.filter(
    t =>
      t.status === 'completed' &&
      t.scheduled_date &&
      t.scheduled_date >= weekAgoStr
  );

  const tasksCompleted = recentCompleted.length;

  // Total tasks in range (for completion rate)
  const recentTotal = tasks.filter(
    t => t.scheduled_date && t.scheduled_date >= weekAgoStr
  ).length;

  const completionRate =
    recentTotal > 0 ? Math.round((tasksCompleted / recentTotal) * 100) : 0;

  // Focus hours from sessions in the past 7 days
  const recentSessions = sessions.filter(s => {
    const sessionDate = s.start_time.split('T')[0];
    return sessionDate >= weekAgoStr;
  });

  const totalFocusSec = recentSessions.reduce(
    (sum, s) => sum + s.duration_seconds,
    0
  );
  const hoursFocused = parseFloat((totalFocusSec / 3600).toFixed(1));

  // Daily focus hours by day-of-week label
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyFocusHours: { [day: string]: number } = {
    Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
  };

  recentSessions.forEach(s => {
    const d = new Date(s.start_time);
    const label = dayLabels[d.getDay()];
    dailyFocusHours[label] =
      parseFloat(((dailyFocusHours[label] || 0) + s.duration_seconds / 3600).toFixed(2));
  });

  // Most productive day (most focus hours)
  const mostProductiveDay =
    Object.entries(dailyFocusHours).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    'N/A';

  // Most productive mission (most completed tasks linked to a mission)
  const missionCounts: Record<string, number> = {};
  recentCompleted.forEach(t => {
    if (t.mission_id) {
      missionCounts[t.mission_id] = (missionCounts[t.mission_id] || 0) + 1;
    }
  });

  const topMissionId = Object.entries(missionCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0];

  const mostProductiveMission = topMissionId
    ? missions.find(m => m.id === topMissionId)?.title || 'General'
    : 'General';

  // Average completion time (estimated_minutes of completed tasks)
  const avgCompletionTimeMinutes =
    recentCompleted.length > 0
      ? Math.round(
          recentCompleted.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0) /
            recentCompleted.length
        )
      : 0;

  return {
    tasksCompleted,
    hoursFocused,
    completionRate,
    mostProductiveDay,
    mostProductiveMission,
    avgCompletionTimeMinutes,
    dailyFocusHours,
  };
}

// ─── Daily Reset ──────────────────────────────────────────────────────────────
export function performDailyResetIfNeeded(): void {
  const lastReset = localStorage.getItem(KEYS.LAST_RESET_DATE);
  const today = todayStr();
  if (lastReset === today) return;

  // Nothing to reset in localStorage (habits handle their own daily state via logs)
  localStorage.setItem(KEYS.LAST_RESET_DATE, today);
}

// ─── Notifications (no-op on web) ────────────────────────────────────────────
export function showNotification(_title: string, _body: string): void {
  // Web Notifications API (optional, won't crash if denied)
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(_title, { body: _body });
  }
}

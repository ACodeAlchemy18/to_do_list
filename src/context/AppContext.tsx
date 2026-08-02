import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Task, Mission, Habit, Settings, WeeklyStats, FilterOptions, TaskStatus, Priority, FocusSession } from '../types';
import { ElectronAPI } from '../../electron/preload';
import * as lsService from '../services/localStorageService';

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

interface AppContextType {
  tasks: Task[];
  missions: Mission[];
  habits: Habit[];
  settings: Settings;
  stats: WeeklyStats | null;
  activeTask: Task | null;
  isTimerRunning: boolean;
  timerSeconds: number;
  pomodoroMode: boolean;
  pomodoroTimeLeft: number;
  pomodoroIsBreak: boolean;
  filter: FilterOptions;
  activeTab: 'dashboard' | 'missions' | 'habits' | 'analytics' | 'settings';
  isTaskModalOpen: boolean;
  editingTask: Task | null;
  isSmartPlannerOpen: boolean;

  // Setters & Actions
  setActiveTab: (tab: 'dashboard' | 'missions' | 'habits' | 'analytics' | 'settings') => void;
  setFilter: React.Dispatch<React.SetStateAction<FilterOptions>>;
  openNewTaskModal: (initialMissionId?: string) => void;
  openEditTaskModal: (task: Task) => void;
  closeTaskModal: () => void;
  setIsSmartPlannerOpen: (open: boolean) => void;

  // Task Actions
  createTask: (taskData: Partial<Task>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  moveTaskToToday: (id: string) => Promise<void>;
  moveTaskToPending: (id: string) => Promise<void>;

  // Focus Timer Actions
  startFocusTimer: (taskId: string) => void;
  pauseFocusTimer: () => void;
  completeActiveTask: () => void;
  togglePomodoroMode: () => void;

  // Mission Actions
  createMission: (title: string, description: string, color: string, icon: string) => Promise<void>;
  deleteMission: (id: string) => Promise<void>;

  // Habit Actions
  createHabit: (title: string, icon: string, color: string, targetDays: string[]) => Promise<void>;
  toggleHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // Settings Actions
  updateSetting: (key: keyof Settings, value: any) => Promise<void>;
  toggleAlwaysOnTop: () => Promise<void>;
  toggleWidgetMode: () => Promise<void>;

  // Procrastination Check
  procrastinationWarning: string | null;
  dismissProcrastinationWarning: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [settings, setSettings] = useState<Settings>({
    theme: 'dark',
    alwaysOnTop: false,
    autoStart: false,
    notificationsEnabled: true,
    dailyReminderTime: '21:00',
    fontSize: 'base',
    widgetMode: false,
    pomodoroLength: 25,
    breakLength: 5,
  });
  const [stats, setStats] = useState<WeeklyStats | null>(null);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const [pomodoroMode, setPomodoroMode] = useState(false);
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60);
  const [pomodoroIsBreak, setPomodoroIsBreak] = useState(false);

  const [filter, setFilter] = useState<FilterOptions>({ priority: 'all', missionId: 'all', status: 'all', searchQuery: '' });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'missions' | 'habits' | 'analytics' | 'settings'>('dashboard');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSmartPlannerOpen, setIsSmartPlannerOpen] = useState(false);

  const [procrastinationWarning, setProcrastinationWarning] = useState<string | null>(null);

  const sessionStartTimeRef = useRef<string | null>(null);

  // Initial Data Fetch
  const refreshData = useCallback(async () => {
    if (window.electronAPI) {
      const [fetchedTasks, fetchedMissions, fetchedHabits, fetchedSettings, fetchedStats] = await Promise.all([
        window.electronAPI.getTasks(),
        window.electronAPI.getMissions(),
        window.electronAPI.getHabits(),
        window.electronAPI.getSettings(),
        window.electronAPI.getWeeklyStats(),
      ]);
      setTasks(fetchedTasks || []);
      setMissions(fetchedMissions || []);
      setHabits(fetchedHabits || []);
      if (fetchedSettings) setSettings(fetchedSettings);
      if (fetchedStats) setStats(fetchedStats);

      // Perform daily reset check
      await window.electronAPI.performDailyResetIfNeeded();
    } else {
      // ── Web / Vercel fallback: use localStorage ──
      const fetchedTasks = lsService.getTasks();
      const fetchedMissions = lsService.getMissions();
      const fetchedHabits = lsService.getHabits();
      const fetchedSettings = lsService.getSettings();
      const fetchedStats = lsService.getWeeklyStats();

      setTasks(fetchedTasks || []);
      setMissions(fetchedMissions || []);
      setHabits(fetchedHabits || []);
      setSettings(fetchedSettings);
      setStats(fetchedStats);

      lsService.performDailyResetIfNeeded();
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Derive active task
  const activeTask = tasks.find(t => t.id === activeTaskId) || tasks.find(t => t.status === 'working') || null;

  useEffect(() => {
    if (activeTask && !activeTaskId) {
      setActiveTaskId(activeTask.id);
      setTimerSeconds(activeTask.actual_seconds || 0);
    }
  }, [activeTask, activeTaskId]);

  // Main Live Focus Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && activeTask) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          const next = prev + 1;

          // Procrastination check (> 3 hours = 10800s in working state)
          if (next >= 10800 && next % 3600 === 0) {
            setProcrastinationWarning(`Task "${activeTask.title}" has been in progress for over ${Math.floor(next / 3600)} hours. Complete it, pause it, or break it down!`);
            if (window.electronAPI) {
              window.electronAPI.showNotification('Procrastination Alert ⚠️', `Task "${activeTask.title}" has been working for over 3 hours.`);
            }
          }

          return next;
        });

        if (pomodoroMode) {
          setPomodoroTimeLeft(prev => {
            if (prev <= 1) {
              // Trigger pomodoro cycle end
              const nextIsBreak = !pomodoroIsBreak;
              setPomodoroIsBreak(nextIsBreak);
              const nextDuration = (nextIsBreak ? settings.breakLength : settings.pomodoroLength) * 60;
              if (window.electronAPI) {
                window.electronAPI.showNotification(
                  nextIsBreak ? '☕ Break Time!' : '🚀 Back to Focus!',
                  nextIsBreak ? `Take a ${settings.breakLength} minute break.` : `Time for a ${settings.pomodoroLength} minute focus session.`
                );
              }
              return nextDuration;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeTask, pomodoroMode, pomodoroIsBreak, settings]);

  // Auto Sync active task duration to DB every 10 seconds
  useEffect(() => {
    if (isTimerRunning && activeTask && timerSeconds > 0 && timerSeconds % 10 === 0) {
      const updated = { ...activeTask, actual_seconds: timerSeconds };
      if (window.electronAPI) {
        window.electronAPI.updateTask(updated);
      } else {
        lsService.updateTask(updated);
      }
    }
  }, [timerSeconds, isTimerRunning, activeTask]);

  // ── Auto-move overdue tasks to Pending ──────────────────────────────────
  // Runs once on mount: any non-completed task whose scheduled_date is before
  // today gets moved to Pending (scheduled_date = null).
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTasks(prev => {
      const updated: Task[] = [];
      let changed = false;

      prev.forEach(t => {
        if (
          t.scheduled_date &&
          t.scheduled_date < today &&
          t.status !== 'completed'
        ) {
          const movedTask = { ...t, scheduled_date: null };
          // Persist the change
          if (window.electronAPI) {
            window.electronAPI.updateTask(movedTask);
          } else {
            lsService.updateTask(movedTask);
          }
          updated.push(movedTask);
          changed = true;
        } else {
          updated.push(t);
        }
      });

      return changed ? updated : prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs only on mount

  // Focus Timer Actions
  const startFocusTimer = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setActiveTaskId(taskId);
    setTimerSeconds(task.actual_seconds || 0);
    setIsTimerRunning(true);
    sessionStartTimeRef.current = new Date().toISOString();

    // Set status to working
    updateTaskStatus(taskId, 'working');
  };

  const pauseFocusTimer = async () => {
    setIsTimerRunning(false);
    if (activeTask) {
      const updated = { ...activeTask, actual_seconds: timerSeconds };
      await updateTask(updated);

      if (sessionStartTimeRef.current) {
        const session: FocusSession = {
          id: `fs_${Date.now()}`,
          task_id: activeTask.id,
          start_time: sessionStartTimeRef.current,
          end_time: new Date().toISOString(),
          duration_seconds: Math.max(1, Math.round((new Date().getTime() - new Date(sessionStartTimeRef.current).getTime()) / 1000)),
        };
        if (window.electronAPI) {
          await window.electronAPI.addFocusSession(session);
        } else {
          lsService.addFocusSession(session);
        }
        sessionStartTimeRef.current = null;
      }
    }
  };

  const completeActiveTask = async () => {
    if (!activeTask) return;
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    await pauseFocusTimer();
    await updateTaskStatus(activeTask.id, 'completed');
    setActiveTaskId(null);
    setTimerSeconds(0);
    setProcrastinationWarning(null);

    if (window.electronAPI) {
      window.electronAPI.showNotification('🎉 Task Completed!', `Awesome job finishing "${activeTask.title}"!`);
    }
  };

  const togglePomodoroMode = () => {
    setPomodoroMode(prev => !prev);
    setPomodoroTimeLeft(settings.pomodoroLength * 60);
    setPomodoroIsBreak(false);
  };

  // Task Actions
  const createTask = async (taskData: Partial<Task>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newTask: Task = {
      id: `task_${Date.now()}`,
      mission_id: taskData.mission_id || null,
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      notes: taskData.notes || '',
      priority: taskData.priority || 'medium',
      status: taskData.status || 'not_started',
      estimated_minutes: taskData.estimated_minutes || 30,
      actual_seconds: 0,
      due_date: taskData.due_date || null,
      scheduled_date: taskData.scheduled_date || todayStr,
      created_at: new Date().toISOString(),
      tags: taskData.tags || [],
      order_index: tasks.length + 1,
    };

    if (window.electronAPI) {
      const saved = await window.electronAPI.createTask(newTask);
      setTasks(prev => [saved, ...prev]);
    } else {
      lsService.createTask(newTask);
      setTasks(prev => [newTask, ...prev]);
    }
    refreshData();
  };

  const updateTask = async (task: Task) => {
    if (window.electronAPI) {
      await window.electronAPI.updateTask(task);
    } else {
      lsService.updateTask(task);
    }
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    refreshData();
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const updated = { ...target, status };
    await updateTask(updated);
  };

  const deleteTask = async (id: string) => {
    if (window.electronAPI) {
      await window.electronAPI.deleteTask(id);
    } else {
      lsService.deleteTask(id);
    }
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskId === id) {
      setActiveTaskId(null);
      setIsTimerRunning(false);
    }
    refreshData();
  };

  const moveTaskToToday = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = { ...target, scheduled_date: todayStr };
    await updateTask(updated);
  };

  const moveTaskToPending = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const updated = { ...target, scheduled_date: null };
    await updateTask(updated);
  };

  // Missions
  const createMission = async (title: string, description: string, color: string, icon: string) => {
    const newMission: Mission = {
      id: `m_${Date.now()}`,
      title,
      description,
      color,
      icon,
      created_at: new Date().toISOString(),
    };
    if (window.electronAPI) {
      await window.electronAPI.createMission(newMission);
    } else {
      lsService.createMission(newMission);
    }
    refreshData();
  };

  const deleteMission = async (id: string) => {
    if (window.electronAPI) {
      await window.electronAPI.deleteMission(id);
    } else {
      lsService.deleteMission(id);
    }
    refreshData();
  };

  // Habits
  const createHabit = async (title: string, icon: string, color: string, targetDays: string[]) => {
    const newHabit: Habit = {
      id: `h_${Date.now()}`,
      title,
      icon,
      color,
      streak_count: 0,
      best_streak: 0,
      created_at: new Date().toISOString(),
      target_days: targetDays,
    };
    if (window.electronAPI) {
      await window.electronAPI.createHabit(newHabit);
    } else {
      lsService.createHabit(newHabit);
    }
    refreshData();
  };

  const deleteHabit = async (id: string) => {
    if (window.electronAPI) {
      // Electron: call API if it supports it, otherwise use localStorage fallback
      if ((window.electronAPI as any).deleteHabit) {
        await (window.electronAPI as any).deleteHabit(id);
      } else {
        lsService.deleteHabit(id);
      }
    } else {
      lsService.deleteHabit(id);
    }
    setHabits(prev => prev.filter(h => h.id !== id));
    refreshData();
  };

  const toggleHabit = async (id: string) => {
    if (window.electronAPI) {
      const res = await window.electronAPI.toggleHabitToday(id);
      if (res.completed) {
        confetti({ particleCount: 50, spread: 60 });
      }
    } else {
      const res = lsService.toggleHabitToday(id);
      if (res.completed) {
        confetti({ particleCount: 50, spread: 60 });
      }
    }
    refreshData();
  };

  // Settings
  const updateSetting = async (key: keyof Settings, value: any) => {
    if (window.electronAPI) {
      const newSettings = await window.electronAPI.updateSetting(key, value);
      setSettings(newSettings);
    } else {
      const newSettings = lsService.updateSetting(key, value);
      setSettings(newSettings);
    }
  };

  const toggleAlwaysOnTop = async () => {
    if (window.electronAPI) {
      const res = await window.electronAPI.toggleAlwaysOnTop();
      updateSetting('alwaysOnTop', res);
    }
  };

  const toggleWidgetMode = async () => {
    const nextWidget = !settings.widgetMode;
    if (window.electronAPI) {
      await window.electronAPI.toggleWidgetMode(nextWidget);
      updateSetting('widgetMode', nextWidget);
    }
  };

  const openNewTaskModal = (initialMissionId?: string) => {
    setEditingTask(null);
    if (initialMissionId) {
      setEditingTask({ mission_id: initialMissionId } as Task);
    }
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const dismissProcrastinationWarning = () => setProcrastinationWarning(null);

  return (
    <AppContext.Provider
      value={{
        tasks,
        missions,
        habits,
        settings,
        stats,
        activeTask,
        isTimerRunning,
        timerSeconds,
        pomodoroMode,
        pomodoroTimeLeft,
        pomodoroIsBreak,
        filter,
        activeTab,
        isTaskModalOpen,
        editingTask,
        isSmartPlannerOpen,
        setActiveTab,
        setFilter,
        openNewTaskModal,
        openEditTaskModal,
        closeTaskModal,
        setIsSmartPlannerOpen,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        moveTaskToToday,
        moveTaskToPending,
        startFocusTimer,
        pauseFocusTimer,
        completeActiveTask,
        togglePomodoroMode,
        createMission,
        deleteMission,
        createHabit,
        toggleHabit,
        deleteHabit,
        updateSetting,
        toggleAlwaysOnTop,
        toggleWidgetMode,
        procrastinationWarning,
        dismissProcrastinationWarning,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

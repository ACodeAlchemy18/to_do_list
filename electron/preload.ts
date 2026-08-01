import { contextBridge, ipcRenderer } from 'electron';
import { Task, Mission, Habit, FocusSession, Settings, WeeklyStats } from '../src/types';

export interface ElectronAPI {
  // Database Operations
  getTasks: () => Promise<Task[]>;
  createTask: (task: Task) => Promise<Task>;
  updateTask: (task: Task) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;

  getMissions: () => Promise<Mission[]>;
  createMission: (mission: Mission) => Promise<Mission>;
  updateMission: (mission: Mission) => Promise<Mission>;
  deleteMission: (id: string) => Promise<void>;

  getHabits: () => Promise<Habit[]>;
  createHabit: (habit: Habit) => Promise<Habit>;
  toggleHabitToday: (habitId: string, completedDate?: string) => Promise<{ habit: Habit; completed: boolean }>;

  addFocusSession: (session: FocusSession) => Promise<FocusSession>;
  getFocusSessions: () => Promise<FocusSession[]>;

  getSettings: () => Promise<Settings>;
  updateSetting: (key: keyof Settings, value: any) => Promise<Settings>;

  performDailyResetIfNeeded: () => Promise<{ resetPerformed: boolean }>;
  getWeeklyStats: () => Promise<WeeklyStats>;

  // Window Operations
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  toggleAlwaysOnTop: (flag?: boolean) => Promise<boolean>;
  toggleWidgetMode: (flag?: boolean) => Promise<boolean>;
  showNotification: (title: string, body: string) => void;
}

const electronAPI: ElectronAPI = {
  getTasks: () => ipcRenderer.invoke('db:getTasks'),
  createTask: (task) => ipcRenderer.invoke('db:createTask', task),
  updateTask: (task) => ipcRenderer.invoke('db:updateTask', task),
  deleteTask: (id) => ipcRenderer.invoke('db:deleteTask', id),

  getMissions: () => ipcRenderer.invoke('db:getMissions'),
  createMission: (mission) => ipcRenderer.invoke('db:createMission', mission),
  updateMission: (mission) => ipcRenderer.invoke('db:updateMission', mission),
  deleteMission: (id) => ipcRenderer.invoke('db:deleteMission', id),

  getHabits: () => ipcRenderer.invoke('db:getHabits'),
  createHabit: (habit) => ipcRenderer.invoke('db:createHabit', habit),
  toggleHabitToday: (habitId, completedDate) => ipcRenderer.invoke('db:toggleHabitToday', habitId, completedDate),

  addFocusSession: (session) => ipcRenderer.invoke('db:addFocusSession', session),
  getFocusSessions: () => ipcRenderer.invoke('db:getFocusSessions'),

  getSettings: () => ipcRenderer.invoke('db:getSettings'),
  updateSetting: (key, value) => ipcRenderer.invoke('db:updateSetting', key, value),

  performDailyResetIfNeeded: () => ipcRenderer.invoke('db:performDailyResetIfNeeded'),
  getWeeklyStats: () => ipcRenderer.invoke('db:getWeeklyStats'),

  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  toggleAlwaysOnTop: (flag) => ipcRenderer.invoke('window:toggleAlwaysOnTop', flag),
  toggleWidgetMode: (flag) => ipcRenderer.invoke('window:toggleWidgetMode', flag),
  showNotification: (title, body) => ipcRenderer.send('app:notification', title, body),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

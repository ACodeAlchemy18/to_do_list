import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { Task, Mission, Habit, FocusSession, Settings, WeeklyStats } from '../../src/types';

export class MissionControlDB {
  private dataFile: string;
  private memoryData: {
    tasks: Task[];
    missions: Mission[];
    habits: Habit[];
    habitLogs: { id: string; habit_id: string; completed_date: string }[];
    focusSessions: FocusSession[];
    settings: Settings;
  };

  constructor() {
    const userDataPath = app.getPath('userData');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    this.dataFile = path.join(userDataPath, 'mission_control_data.json');

    this.memoryData = {
      tasks: [],
      missions: [],
      habits: [],
      habitLogs: [],
      focusSessions: [],
      settings: {
        theme: 'dark',
        alwaysOnTop: false,
        autoStart: false,
        notificationsEnabled: true,
        dailyReminderTime: '21:00',
        fontSize: 'base',
        widgetMode: false,
        pomodoroLength: 25,
        breakLength: 5,
      },
    };

    this.init();
  }

  private init() {
    if (fs.existsSync(this.dataFile)) {
      try {
        const raw = fs.readFileSync(this.dataFile, 'utf-8');
        this.memoryData = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Error loading data file:', err);
      }
    }
    this.seedInitialData();
  }

  private saveData() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.memoryData, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving data file:', err);
    }
  }

  private seedInitialData() {
    const todayStr = new Date().toISOString().split('T')[0];

    this.memoryData.missions = [
      { id: 'm1', title: 'Java Learning', description: 'Master core Java & Spring Boot', color: '#3B82F6', icon: 'code', created_at: new Date().toISOString() },
      { id: 'm2', title: 'LLM Fine Tuning', description: 'Dataset prep & QLoRA training', color: '#8B5CF6', icon: 'cpu', created_at: new Date().toISOString() },
      { id: 'm3', title: 'Resume Building', description: 'Update portfolio & resume projects', color: '#EC4899', icon: 'file-text', created_at: new Date().toISOString() },
      { id: 'm4', title: 'Job Preparation', description: 'System design & coding practice', color: '#10B981', icon: 'briefcase', created_at: new Date().toISOString() },
    ];

    this.memoryData.habits = [
      { id: 'h1', title: 'Drink Water', icon: 'droplet', color: '#06B6D4', streak_count: 5, best_streak: 12, created_at: new Date().toISOString() },
      { id: 'h2', title: 'Exercise', icon: 'activity', color: '#EF4444', streak_count: 3, best_streak: 7, created_at: new Date().toISOString() },
      { id: 'h3', title: 'Meditation', icon: 'sun', color: '#F59E0B', streak_count: 8, best_streak: 15, created_at: new Date().toISOString() },
      { id: 'h4', title: 'Reading', icon: 'book', color: '#10B981', streak_count: 4, best_streak: 10, created_at: new Date().toISOString() },
    ];

    this.memoryData.tasks = [
      {
        id: 't1',
        mission_id: 'm1',
        title: 'Complete Concurrency & Multithreading Modules',
        description: 'Review Java Memory Model & Executor Services',
        priority: 'high',
        status: 'working',
        estimated_minutes: 60,
        actual_seconds: 1450,
        scheduled_date: todayStr,
        created_at: new Date().toISOString(),
        tags: ['java', 'backend'],
        order_index: 1,
      },
      {
        id: 't2',
        mission_id: 'm2',
        title: 'Format Synthetic Training Dataset JSONL',
        description: 'Clean prompts & verify token lengths',
        priority: 'high',
        status: 'completed',
        estimated_minutes: 45,
        actual_seconds: 2700,
        scheduled_date: todayStr,
        created_at: new Date().toISOString(),
        tags: ['ai', 'python'],
        order_index: 2,
      },
      {
        id: 't3',
        mission_id: 'm3',
        title: 'Add Mission Control Project to Portfolio',
        description: 'Highlight Electron + SQLite offline performance',
        priority: 'medium',
        status: 'not_started',
        estimated_minutes: 30,
        actual_seconds: 0,
        scheduled_date: todayStr,
        created_at: new Date().toISOString(),
        tags: ['portfolio', 'electron'],
        order_index: 3,
      },
      {
        id: 't4',
        mission_id: 'm4',
        title: 'Practice 3 LeetCode Medium Questions',
        description: 'Focus on Dynamic Programming & Graphs',
        priority: 'high',
        status: 'not_started',
        estimated_minutes: 90,
        actual_seconds: 0,
        due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        tags: ['dsa', 'interview'],
        order_index: 4,
      },
      {
        id: 't5',
        mission_id: 'm1',
        title: 'Build Spring Security JWT Auth Service',
        description: 'Implement refresh tokens and custom UserDetails',
        priority: 'medium',
        status: 'not_started',
        estimated_minutes: 120,
        actual_seconds: 0,
        due_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        tags: ['spring', 'java'],
        order_index: 5,
      }
    ];

    this.saveData();
  }

  // --- MISSION REPOSITORY ---
  public getMissions(): Mission[] {
    return this.memoryData.missions.map(m => this.attachMissionCounts(m));
  }

  private attachMissionCounts(m: Mission): Mission {
    const tasks = this.getTasks().filter(t => t.mission_id === m.id);
    return {
      ...m,
      total_tasks: tasks.length,
      completed_tasks: tasks.filter(t => t.status === 'completed').length
    };
  }

  public createMission(mission: Mission): Mission {
    this.memoryData.missions.push(mission);
    this.saveData();
    return mission;
  }

  public updateMission(mission: Mission): Mission {
    const idx = this.memoryData.missions.findIndex(m => m.id === mission.id);
    if (idx !== -1) {
      this.memoryData.missions[idx] = mission;
      this.saveData();
    }
    return mission;
  }

  public deleteMission(id: string): void {
    this.memoryData.missions = this.memoryData.missions.filter(m => m.id !== id);
    this.memoryData.tasks.forEach(t => {
      if (t.mission_id === id) t.mission_id = null;
    });
    this.saveData();
  }

  // --- TASK REPOSITORY ---
  public getTasks(): Task[] {
    return this.memoryData.tasks;
  }

  public createTask(task: Task): Task {
    this.memoryData.tasks.push(task);
    this.saveData();
    return task;
  }

  public updateTask(task: Task): Task {
    const idx = this.memoryData.tasks.findIndex(t => t.id === task.id);
    if (idx !== -1) {
      this.memoryData.tasks[idx] = task;
      this.saveData();
    }
    return task;
  }

  public deleteTask(id: string): void {
    this.memoryData.tasks = this.memoryData.tasks.filter(t => t.id !== id);
    this.saveData();
  }

  // --- HABIT REPOSITORY ---
  public getHabits(): Habit[] {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.memoryData.habits.map(h => ({
      ...h,
      completed_today: this.memoryData.habitLogs.some(l => l.habit_id === h.id && l.completed_date === todayStr)
    }));
  }

  public createHabit(habit: Habit): Habit {
    this.memoryData.habits.push(habit);
    this.saveData();
    return habit;
  }

  public toggleHabitToday(habitId: string, completedDate?: string): { habit: Habit; completed: boolean } {
    const todayStr = completedDate || new Date().toISOString().split('T')[0];
    const idx = this.memoryData.habits.findIndex(h => h.id === habitId);
    if (idx === -1) throw new Error('Habit not found');
    const habit = this.memoryData.habits[idx];
    const logIdx = this.memoryData.habitLogs.findIndex(l => l.habit_id === habitId && l.completed_date === todayStr);

    let isCompleted = false;
    if (logIdx !== -1) {
      this.memoryData.habitLogs.splice(logIdx, 1);
      habit.streak_count = Math.max(0, habit.streak_count - 1);
      isCompleted = false;
    } else {
      this.memoryData.habitLogs.push({ id: `hl_${Date.now()}`, habit_id: habitId, completed_date: todayStr });
      habit.streak_count += 1;
      if (habit.streak_count > habit.best_streak) {
        habit.best_streak = habit.streak_count;
      }
      habit.last_completed_date = todayStr;
      isCompleted = true;
    }
    this.saveData();
    return { habit: { ...habit, completed_today: isCompleted }, completed: isCompleted };
  }

  // --- FOCUS SESSION REPOSITORY ---
  public addFocusSession(session: FocusSession): FocusSession {
    this.memoryData.focusSessions.push(session);
    this.saveData();
    return session;
  }

  public getFocusSessions(): FocusSession[] {
    return this.memoryData.focusSessions;
  }

  // --- SETTINGS REPOSITORY ---
  public getSettings(): Settings {
    return this.memoryData.settings;
  }

  public updateSetting(key: keyof Settings, value: any): Settings {
    (this.memoryData.settings as any)[key] = value;
    this.saveData();
    return this.memoryData.settings;
  }

  // --- DAILY RESET & STATS ---
  public performDailyResetIfNeeded(): { resetPerformed: boolean } {
    const todayStr = new Date().toISOString().split('T')[0];
    const tasks = this.getTasks();

    let resetCount = 0;
    tasks.forEach(t => {
      if (t.scheduled_date && t.scheduled_date < todayStr && t.status !== 'completed') {
        t.scheduled_date = null;
        this.updateTask(t);
        resetCount++;
      }
    });

    return { resetPerformed: resetCount > 0 };
  }

  public getWeeklyStats(): WeeklyStats {
    const tasks = this.getTasks();
    const sessions = this.getFocusSessions();
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const totalFocusSeconds = sessions.reduce((acc, s) => acc + s.duration_seconds, 0);

    const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

    const dailyFocusHours: { [day: string]: number } = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    sessions.forEach(s => {
      const d = new Date(s.start_time);
      const dayName = dayNames[d.getDay()];
      dailyFocusHours[dayName] = (dailyFocusHours[dayName] || 0) + s.duration_seconds / 3600;
    });

    let topDay = 'Today';
    let maxHours = 0;
    Object.entries(dailyFocusHours).forEach(([day, hours]) => {
      if (hours > maxHours) {
        maxHours = hours;
        topDay = day;
      }
    });

    const missionFocus: { [id: string]: number } = {};
    completedTasks.forEach(t => {
      if (t.mission_id) {
        missionFocus[t.mission_id] = (missionFocus[t.mission_id] || 0) + 1;
      }
    });
    let topMissionId = '';
    let maxTasks = 0;
    Object.entries(missionFocus).forEach(([id, count]) => {
      if (count > maxTasks) {
        maxTasks = count;
        topMissionId = id;
      }
    });
    const missions = this.getMissions();
    const topMissionObj = missions.find(m => m.id === topMissionId);

    const avgMinutes = completedTasks.length > 0
      ? Math.round(completedTasks.reduce((acc, t) => acc + (t.actual_seconds / 60), 0) / completedTasks.length)
      : 30;

    return {
      tasksCompleted: completedTasks.length,
      hoursFocused: parseFloat((totalFocusSeconds / 3600).toFixed(1)),
      completionRate,
      mostProductiveDay: topDay,
      mostProductiveMission: topMissionObj ? topMissionObj.title : 'General Tasks',
      avgCompletionTimeMinutes: avgMinutes,
      dailyFocusHours,
    };
  }
}

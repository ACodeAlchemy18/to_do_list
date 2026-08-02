export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'not_started' | 'working' | 'blocked' | 'completed';

export interface Task {
  id: string;
  mission_id?: string | null;
  title: string;
  description?: string;
  notes?: string;
  priority: Priority;
  status: TaskStatus;
  estimated_minutes: number;
  actual_seconds: number;
  due_date?: string | null;
  scheduled_date?: string | null; // e.g. today's date format 'YYYY-MM-DD'
  created_at: string;
  tags: string[];
  category?: string;
  order_index: number;
}

export interface Mission {
  id: string;
  title: string;
  description?: string;
  color: string;
  icon: string;
  created_at: string;
  // Computed properties
  total_tasks?: number;
  completed_tasks?: number;
}

export interface Habit {
  id: string;
  title: string;
  icon: string;
  color: string;
  streak_count: number;
  best_streak: number;
  last_completed_date?: string | null;
  created_at: string;
  completed_today?: boolean;
  // Days of the week this habit should be tracked, e.g. ['Mon','Wed','Fri']
  // Empty array or undefined means every day
  target_days?: string[];
}

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_date: string; // YYYY-MM-DD
}

export interface FocusSession {
  id: string;
  task_id: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
}

export interface Settings {
  theme: 'dark' | 'light';
  alwaysOnTop: boolean;
  autoStart: boolean;
  notificationsEnabled: boolean;
  dailyReminderTime: string;
  fontSize: 'sm' | 'base' | 'lg';
  widgetMode: boolean;
  pomodoroLength: number;
  breakLength: number;
}

export interface WeeklyStats {
  tasksCompleted: number;
  hoursFocused: number;
  completionRate: number;
  mostProductiveDay: string;
  mostProductiveMission: string;
  avgCompletionTimeMinutes: number;
  dailyFocusHours: { [day: string]: number };
}

export interface FilterOptions {
  priority?: Priority | 'all';
  missionId?: string | 'all';
  status?: TaskStatus | 'all';
  searchQuery?: string;
}


export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export type SkillArchetype = 'PHYSICAL' | 'MENTAL' | 'TECHNICAL' | 'SOCIAL' | 'DISCIPLINE';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  archetype: SkillArchetype;
  scheduledTime?: string;
  alarmsEnabled: boolean;
  isActive: boolean;
  isStrict: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  userId: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  note?: string;
  energyLevel?: number;
}

export interface MonthlyReport {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  totalDays: number;
  perfectDaysCount: number;
  avgCompletionRate: number;
  bestHabit: string;
  worstHabit: string;
  longestStreak: number;
  createdAt: string;
}

export type View = 'dashboard' | 'tracking' | 'reports' | 'settings';

export interface AuthState {
  user: User | null;
  token: string | null;
}

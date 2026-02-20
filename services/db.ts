
import { Habit, HabitLog, MonthlyReport, User } from '../types';

const STORAGE_KEYS = {
  USERS: 'zenith_users',
  HABITS: 'zenith_habits',
  LOGS: 'zenith_logs',
  REPORTS: 'zenith_reports',
  INITIALIZED: 'zenith_initialized_flag'
};

const get = <T,>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const save = <T,>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const db = {
  initialization: {
    isInitialized: (userId: string) => localStorage.getItem(`${STORAGE_KEYS.INITIALIZED}_${userId}`) === 'true',
    setInitialized: (userId: string) => localStorage.setItem(`${STORAGE_KEYS.INITIALIZED}_${userId}`, 'true'),
    resetInitialized: (userId: string) => localStorage.removeItem(`${STORAGE_KEYS.INITIALIZED}_${userId}`)
  },
  users: {
    find: (email: string) => get<User & { passwordHash: string }>(STORAGE_KEYS.USERS).find(u => u.email === email),
    create: (user: User & { passwordHash: string }) => {
      const users = get<User & { passwordHash: string }>(STORAGE_KEYS.USERS);
      users.push(user);
      save(STORAGE_KEYS.USERS, users);
    }
  },
  habits: {
    list: (userId: string) => get<Habit>(STORAGE_KEYS.HABITS).filter(h => h.userId === userId),
    create: (habit: Habit) => {
      const habits = get<Habit>(STORAGE_KEYS.HABITS);
      habits.push(habit);
      save(STORAGE_KEYS.HABITS, habits);
    },
    update: (userId: string, habitId: string, updates: Partial<Habit>) => {
      const habits = get<Habit>(STORAGE_KEYS.HABITS);
      const index = habits.findIndex(h => h.id === habitId && h.userId === userId);
      if (index !== -1) {
        habits[index] = { ...habits[index], ...updates };
        save(STORAGE_KEYS.HABITS, habits);
      }
    },
    remove: (userId: string, habitId: string) => {
      const habits = get<Habit>(STORAGE_KEYS.HABITS).filter(h => !(h.id === habitId && h.userId === userId));
      const logs = get<HabitLog>(STORAGE_KEYS.LOGS).filter(l => !(l.habitId === habitId && l.userId === userId));
      save(STORAGE_KEYS.HABITS, habits);
      save(STORAGE_KEYS.LOGS, logs);
    },
    clearAll: (userId: string) => {
      const habits = get<Habit>(STORAGE_KEYS.HABITS).filter(h => h.userId !== userId);
      const logs = get<HabitLog>(STORAGE_KEYS.LOGS).filter(l => l.userId !== userId);
      save(STORAGE_KEYS.HABITS, habits);
      save(STORAGE_KEYS.LOGS, logs);
    }
  },
  logs: {
    list: (userId: string) => get<HabitLog>(STORAGE_KEYS.LOGS).filter(l => l.userId === userId),
    upsert: (userId: string, log: HabitLog) => {
      const logs = get<HabitLog>(STORAGE_KEYS.LOGS);
      const index = logs.findIndex(l => l.userId === userId && l.habitId === log.habitId && l.date === log.date);
      if (index !== -1) {
        logs[index] = { ...logs[index], ...log };
      } else {
        logs.push(log);
      }
      save(STORAGE_KEYS.LOGS, logs);
    }
  },
  reports: {
    list: (userId: string) => get<MonthlyReport>(STORAGE_KEYS.REPORTS).filter(r => r.userId === userId),
    create: (report: MonthlyReport) => {
      const reports = get<MonthlyReport>(STORAGE_KEYS.REPORTS);
      reports.push(report);
      save(STORAGE_KEYS.REPORTS, reports);
    }
  }
};

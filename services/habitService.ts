
import { db } from './db';
import { Habit, HabitLog, MonthlyReport, SkillArchetype } from '../types';
import { getMonthStr, getDaysInMonth } from '../utils/dateUtils';
import { calculateStreak } from '../utils/streakUtils';

export const habitService = {
  getHabits: async (userId: string): Promise<Habit[]> => {
    return db.habits.list(userId);
  },

  createHabit: async (userId: string, name: string, isStrict: boolean = false, scheduledTime?: string, archetype: SkillArchetype = 'DISCIPLINE'): Promise<Habit> => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      userId,
      name,
      archetype,
      scheduledTime,
      alarmsEnabled: false,
      isActive: true,
      isStrict,
      createdAt: new Date().toISOString(),
    };
    db.habits.create(newHabit);
    return newHabit;
  },

  deleteHabit: async (userId: string, habitId: string) => {
    db.habits.remove(userId, habitId);
  },

  clearAllHabits: async (userId: string) => {
    db.habits.clearAll(userId);
    db.initialization.setInitialized(userId); // Prevent auto-respawn
  },

  isInitialized: (userId: string) => db.initialization.isInitialized(userId),
  setInitialized: (userId: string) => db.initialization.setInitialized(userId),

  toggleHabitActive: async (userId: string, habitId: string, isActive: boolean) => {
    db.habits.update(userId, habitId, { isActive });
  },

  toggleHabitAlarm: async (userId: string, habitId: string, alarmsEnabled: boolean) => {
    db.habits.update(userId, habitId, { alarmsEnabled });
  },

  getLogs: async (userId: string): Promise<HabitLog[]> => {
    return db.logs.list(userId);
  },

  toggleLog: async (userId: string, habitId: string, date: string, completed: boolean): Promise<HabitLog> => {
    const log: HabitLog = {
      id: crypto.randomUUID(),
      userId,
      habitId,
      date,
      completed,
    };
    db.logs.upsert(userId, log);
    return log;
  },

  saveNote: async (userId: string, habitId: string, date: string, note: string): Promise<HabitLog> => {
    const log: any = {
      userId,
      habitId,
      date,
      note,
    };
    db.logs.upsert(userId, log as HabitLog);
    return log as HabitLog;
  },

  generateMonthlyReport: async (userId: string, month: string): Promise<MonthlyReport | null> => {
    const habits = db.habits.list(userId);
    const allLogs = db.logs.list(userId);
    const monthLogs = allLogs.filter(l => l.date.startsWith(month));
    
    if (habits.length === 0 || monthLogs.length === 0) return null;

    const daysInMonth = getDaysInMonth(month);
    const habitStats = habits.map(h => {
      const habitLogs = monthLogs.filter(l => l.habitId === h.id);
      const completedCount = habitLogs.filter(l => l.completed).length;
      const { longest } = calculateStreak(h.id, monthLogs);
      return { id: h.id, name: h.name, rate: (completedCount / daysInMonth) * 100, streak: longest };
    });

    const bestHabitObj = habitStats.reduce((prev, curr) => (prev.rate > curr.rate ? prev : curr));
    const worstHabitObj = habitStats.reduce((prev, curr) => (prev.rate < curr.rate ? prev : curr));
    const avgRate = habitStats.reduce((sum, h) => sum + h.rate, 0) / habitStats.length;
    const maxMonthlyStreak = Math.max(...habitStats.map(h => h.streak));

    const logsByDate: Record<string, HabitLog[]> = {};
    monthLogs.forEach(l => {
      if (!logsByDate[l.date]) logsByDate[l.date] = [];
      logsByDate[l.date].push(l);
    });
    
    const perfectDays = Object.values(logsByDate).filter(dayLogs => 
      dayLogs.length >= habits.length && dayLogs.every(l => l.completed)
    ).length;

    const report: MonthlyReport = {
      id: crypto.randomUUID(),
      userId,
      month,
      totalDays: daysInMonth,
      perfectDaysCount: perfectDays,
      avgCompletionRate: Math.round(avgRate),
      bestHabit: bestHabitObj.name,
      worstHabit: worstHabitObj.name,
      longestStreak: maxMonthlyStreak,
      createdAt: new Date().toISOString(),
    };

    db.reports.create(report);
    return report;
  },

  getReports: async (userId: string): Promise<MonthlyReport[]> => {
    return db.reports.list(userId);
  }
};

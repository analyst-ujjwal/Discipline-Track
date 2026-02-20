
import { HabitLog } from '../types';
import { getTodayStr } from './dateUtils';

/**
 * Calculates current and longest streaks for a specific habit.
 * A streak is defined as consecutive days of 'completed: true' logs.
 * Current streak remains active if the last completion was today or yesterday.
 */
export const calculateStreak = (habitId: string, logs: HabitLog[]) => {
  // 1. Filter and Sort logs chronologically (oldest to newest)
  const habitLogs = logs
    .filter(l => l.habitId === habitId)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (habitLogs.length === 0) return { current: 0, longest: 0 };

  // 2. Setup reference dates
  const todayStr = getTodayStr();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  let longestStreak = 0;
  let runningStreak = 0;
  let lastDate: Date | null = null;

  // 3. Process logs to find longest streak and build running streak
  for (const log of habitLogs) {
    const currentDate = new Date(log.date);
    
    if (log.completed) {
      if (lastDate) {
        // Calculate day difference (Dates from YYYY-MM-DD strings are UTC midnight)
        const diffInMs = currentDate.getTime() - lastDate.getTime();
        const diffInDays = Math.round(diffInMs / (1000 * 3600 * 24));
        
        if (diffInDays === 1) {
          // Consecutive completion
          runningStreak++;
        } else {
          // Gap detected, reset running streak to 1 (starting a new one today)
          runningStreak = 1;
        }
      } else {
        // First completion in history
        runningStreak = 1;
      }
    } else {
      // Explicitly marked as incomplete
      runningStreak = 0;
    }
    
    lastDate = currentDate;
    longestStreak = Math.max(longestStreak, runningStreak);
  }

  // 4. Determine if the running streak is still "Current"
  // The streak is current if the last log was today or yesterday.
  const lastLog = habitLogs[habitLogs.length - 1];
  let currentStreak = 0;

  if (lastLog.date === todayStr) {
    // If today is logged, current streak is whatever we ended with in the loop
    currentStreak = runningStreak;
  } else if (lastLog.date === yesterdayStr) {
    // If today is NOT logged yet, but yesterday was, the streak is alive
    // UNLESS yesterday was explicitly failed (runningStreak would be 0)
    currentStreak = runningStreak;
  } else {
    // The last log was before yesterday, the streak has broken
    currentStreak = 0;
  }

  return { current: currentStreak, longest: longestStreak };
};

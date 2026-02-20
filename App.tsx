
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, User, Habit, HabitLog, SkillArchetype } from './types';
import { authService } from './services/authService';
import { habitService } from './services/habitService';
import { getTodayStr } from './utils/dateUtils';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import HabitGrid from './components/HabitGrid';
import Reports from './components/Reports';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const notifiedRef = useRef<Record<string, string>>({});

  const sortHabits = (h: Habit[]) => {
    return [...h].sort((a, b) => {
      if (a.scheduledTime && b.scheduledTime) {
        return a.scheduledTime.localeCompare(b.scheduledTime);
      }
      if (a.scheduledTime) return -1;
      if (b.scheduledTime) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  useEffect(() => {
    const session = authService.getSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [habitsData, logsData] = await Promise.all([
      habitService.getHabits(user.id),
      habitService.getLogs(user.id)
    ]);
    
    if (habitsData.length === 0 && !habitService.isInitialized(user.id)) {
      const defaults: {name: string, time: string, strict: boolean, arch: SkillArchetype}[] = [
        { name: "Wake up at 6 AM", time: "06:00", strict: false, arch: 'PHYSICAL' },
        { name: "Morning routine", time: "07:00", strict: false, arch: 'DISCIPLINE' },
        { name: "Workout", time: "08:00", strict: false, arch: 'PHYSICAL' },
        { name: "Studying / Deep Work", time: "09:00", strict: false, arch: 'TECHNICAL' },
        { name: "Meditation", time: "12:30", strict: false, arch: 'MENTAL' },
        { name: "Social Networking", time: "17:00", strict: false, arch: 'SOCIAL' },
        { name: "Reading", time: "21:00", strict: false, arch: 'MENTAL' },
        { name: "No Junk Content", time: "21:30", strict: true, arch: 'DISCIPLINE' },
        { name: "Sleep Protocol", time: "22:00", strict: true, arch: 'PHYSICAL' }
      ];
      
      for (const item of defaults) {
        await habitService.createHabit(user.id, item.name, item.strict, item.time, item.arch);
      }
      habitService.setInitialized(user.id);
      const refreshed = await habitService.getHabits(user.id);
      setHabits(sortHabits(refreshed));
    } else {
      setHabits(sortHabits(habitsData));
    }
    setLogs(logsData);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // MISSION CONTROL: ALARM MONITORING
  useEffect(() => {
    const monitorAlarms = setInterval(() => {
      if (habits.length === 0) return;

      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, '0');
      const currentM = now.getMinutes().toString().padStart(2, '0');
      const timeStr = `${currentH}:${currentM}`;
      const today = getTodayStr();

      habits.forEach(habit => {
        if (habit.isActive && habit.alarmsEnabled && habit.scheduledTime === timeStr) {
          const notificationKey = `${habit.id}-${today}-${timeStr}`;
          
          // Check if already notified for this specific minute
          if (!notifiedRef.current[notificationKey]) {
            // Trigger System Notification
            if (Notification.permission === 'granted') {
              new Notification("MISSION_ALERT: Node Synchronization Required", {
                body: `Protocol [${habit.name}] window is currently OPEN. Execute mission now.`,
                icon: '/favicon.ico',
                tag: habit.id,
                requireInteraction: true
              });
            }

            // Mark as notified
            notifiedRef.current[notificationKey] = 'true';
            
            // Cleanup old keys to prevent memory leak
            if (Object.keys(notifiedRef.current).length > 100) {
              notifiedRef.current = { [notificationKey]: 'true' };
            }
          }
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(monitorAlarms);
  }, [habits]);

  const handleLogin = (u: User) => setUser(u);
  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const handleToggleLog = async (habitId: string, date: string, completed: boolean) => {
    if (!user) return;
    await habitService.toggleLog(user.id, habitId, date, completed);
    const updatedLogs = await habitService.getLogs(user.id);
    setLogs(updatedLogs);
  };

  const handleSaveNote = async (habitId: string, date: string, note: string) => {
    if (!user) return;
    await habitService.saveNote(user.id, habitId, date, note);
    const updatedLogs = await habitService.getLogs(user.id);
    setLogs(updatedLogs);
  };

  const handleCreateHabit = async (name: string, isStrict: boolean, archetype: SkillArchetype, time?: string) => {
    if (!user) return;
    await habitService.createHabit(user.id, name, isStrict, time, archetype);
    await fetchData();
  };

  const handleToggleHabitActive = async (habitId: string, active: boolean) => {
    if (!user) return;
    await habitService.toggleHabitActive(user.id, habitId, active);
    await fetchData();
  };

  const handleToggleHabitAlarm = async (habitId: string, enabled: boolean) => {
    if (!user) return;
    await habitService.toggleHabitAlarm(user.id, habitId, enabled);
    await fetchData();
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!user) return;
    await habitService.deleteHabit(user.id, habitId);
    await fetchData();
  };

  const handleSystemWipe = async () => {
    if (!user) return;
    await habitService.clearAllHabits(user.id);
    await fetchData();
  };

  const handleExportData = () => {
    const data = { user, habits, logs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discipline_track_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="text-indigo-400 font-black tracking-widest animate-pulse uppercase text-[10px]">INITIALIZING_NEURO_LINK...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleLogin} />;
  }

  return (
    <Layout 
      user={user} 
      logs={logs}
      currentView={currentView} 
      onViewChange={setCurrentView} 
      onLogout={handleLogout}
    >
      {currentView === 'dashboard' && <Dashboard habits={habits} logs={logs} onViewChange={setCurrentView} />}
      {currentView === 'tracking' && (
        <HabitGrid 
          habits={habits} 
          logs={logs} 
          onToggle={handleToggleLog} 
          onSaveNote={handleSaveNote}
        />
      )}
      {currentView === 'reports' && <Reports user={user} />}
      {currentView === 'settings' && (
        <Settings 
          habits={habits} 
          onCreate={handleCreateHabit} 
          onToggle={handleToggleHabitActive} 
          onToggleAlarm={handleToggleHabitAlarm}
          onDelete={handleDeleteHabit}
          onSystemWipe={handleSystemWipe}
          onExport={handleExportData}
        />
      )}
    </Layout>
  );
};

export default App;


import React, { useMemo } from 'react';
import { View, User, HabitLog } from '../types';
import { calculateLevel } from '../utils/levelUtils';

interface LayoutProps {
  user: User;
  logs: HabitLog[];
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, logs, currentView, onViewChange, onLogout, children }) => {
  const levelData = useMemo(() => {
    const completions = logs.filter(l => l.completed).length;
    return calculateLevel(completions);
  }, [logs]);

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'tracking', label: 'Tracking', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 border-r border-slate-800/50 backdrop-blur-xl">
        <div className="p-8">
          <h1 className="text-2xl font-black tracking-tighter text-white leading-none">
            DISCIPLINE<span className="text-indigo-500">.</span>TRACK
          </h1>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-2">Neural_Interface_v2.5</p>
        </div>
        
        <div className="px-6 mb-8">
           <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rank: {levelData.rank}</span>
                <span className="text-[10px] font-mono text-indigo-400">{levelData.xp} XP</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" 
                  style={{ width: `${levelData.progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                 <span className="text-[8px] text-slate-600 uppercase font-bold">Progress</span>
                 <span className="text-[8px] text-slate-600 uppercase font-bold">Next: {levelData.nextRank}</span>
              </div>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                currentView === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <svg className={`w-5 h-5 mr-3 transition-transform duration-200 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50">
          <div className="flex items-center px-4 py-3 mb-4 bg-slate-950/30 rounded-xl border border-slate-800/30">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm font-black text-indigo-400">
              {user.email[0].toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-xs font-bold truncate text-slate-300">{user.email}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-tighter">Authorized Entity</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20 uppercase tracking-widest"
          >
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="flex flex-col flex-1">
        <header className="md:hidden flex items-center justify-between p-5 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
          <h1 className="text-xl font-black tracking-tighter text-white">DISCIPLINE<span className="text-indigo-500">.</span>TRACK</h1>
          <button onClick={onLogout} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 animate-in fade-in duration-500">
          {children}
        </main>

        <nav className="md:hidden flex justify-around p-3 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 sticky bottom-0 z-50">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                currentView === item.id ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-500'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="text-[9px] mt-1.5 font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;

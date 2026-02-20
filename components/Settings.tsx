
import React, { useState, useEffect } from 'react';
import { Habit, SkillArchetype } from '../types';

interface SettingsProps {
  habits: Habit[];
  onCreate: (name: string, isStrict: boolean, archetype: SkillArchetype, time?: string) => void;
  onToggle: (habitId: string, active: boolean) => void;
  onToggleAlarm: (habitId: string, enabled: boolean) => void;
  onDelete: (habitId: string) => void;
  onSystemWipe: () => void;
  onExport: () => void;
}

const Settings: React.FC<SettingsProps> = ({ habits, onCreate, onToggle, onToggleAlarm, onDelete, onSystemWipe, onExport }) => {
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('');
  const [isStrict, setIsStrict] = useState(false);
  const [archetype, setArchetype] = useState<SkillArchetype>('DISCIPLINE');
  const [wipeConfirm, setWipeConfirm] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(Notification.permission);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreate(newName.trim(), isStrict, archetype, newTime || undefined);
    setNewName('');
    setNewTime('');
    setIsStrict(false);
  };

  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
  };

  const archTypes: SkillArchetype[] = ['PHYSICAL', 'MENTAL', 'TECHNICAL', 'SOCIAL', 'DISCIPLINE'];

  return (
    <div className="max-w-4xl space-y-12 pb-24">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase">System_Config</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-1 italic opacity-60">Modular Protocol Management</p>
        </div>
        {notifPermission !== 'granted' && (
          <button 
            onClick={requestPermission}
            className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all"
          >
            Authorize_Neural_Alerts
          </button>
        )}
      </header>

      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl">
        <h3 className="text-sm font-black text-indigo-400 flex items-center uppercase tracking-widest">
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Initialize New Protocol
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black text-slate-500 tracking-widest">Protocol Identifier</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="EX: Neural_Deep_Work"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold tracking-tight text-white placeholder-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black text-slate-500 tracking-widest">Skill Archetype</label>
              <select
                value={archetype}
                onChange={(e) => setArchetype(e.target.value as SkillArchetype)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-white appearance-none"
              >
                {archTypes.map(at => <option key={at} value={at}>{at}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6 pt-2">
            <div className="flex items-center gap-10">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-slate-500 tracking-widest">Execution Window</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-black text-white"
                  />
                </div>
                <label className="flex items-center cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={isStrict}
                    onChange={(e) => setIsStrict(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`mr-4 w-12 h-6 rounded-full transition-all relative ${isStrict ? 'bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.4)]' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isStrict ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isStrict ? 'text-rose-400' : 'text-slate-500'}`}>Strict Protocol</span>
                </label>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-1 active:scale-95 text-white"
            >
              Add Protocol
            </button>
          </div>
        </form>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Protocol Registry</h3>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{habits.length} Nodes Active</span>
        </div>
        <div className="divide-y divide-slate-800">
          {habits.length === 0 ? (
            <div className="p-10 text-center text-slate-600 italic font-mono text-xs uppercase">No protocols registered in database. System Idle.</div>
          ) : (
            habits.map((habit) => (
              <div key={habit.id} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-all group">
                <div className="flex items-center gap-6">
                  <div className={`w-3 h-3 rounded-full ${habit.isStrict ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-black text-white uppercase tracking-tight">{habit.name}</p>
                      <span className="text-[9px] px-2 py-0.5 rounded-lg border border-slate-700 text-slate-500 uppercase font-black">{habit.archetype}</span>
                    </div>
                    <div className="flex gap-4 mt-1">
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Registered: {new Date(habit.createdAt).toLocaleDateString()}</p>
                      {habit.scheduledTime && <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Window: {habit.scheduledTime}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {habit.scheduledTime && (
                    <button
                      onClick={() => onToggleAlarm(habit.id, !habit.alarmsEnabled)}
                      className={`p-2.5 rounded-xl transition-all border ${
                        habit.alarmsEnabled 
                          ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                          : 'border-slate-800 text-slate-700 hover:text-slate-500'
                      }`}
                      title={habit.alarmsEnabled ? 'Disable Alarm' : 'Enable Alarm'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => onToggle(habit.id, !habit.isActive)}
                    className={`px-4 py-1.5 text-[9px] font-black rounded-xl border transition-all ${
                      habit.isActive 
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                        : 'border-slate-700 text-slate-500 bg-slate-800'
                    }`}
                  >
                    {habit.isActive ? 'ACTIVE' : 'DISABLED'}
                  </button>
                  <button
                    onClick={() => { if(confirm(`Terminate Protocol: ${habit.name}?`)) onDelete(habit.id); }}
                    className="p-2.5 rounded-xl text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                    title="Terminate Node"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bg-slate-950 border border-slate-800/50 rounded-3xl p-8 space-y-6">
        <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest">Critical_Systems_Override</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">Exporting allows for neural persistence. System Wipe is irreversible and will purge all nodes and logs from the local interface.</p>
        
        <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={onExport}
              className="flex items-center px-6 py-3 bg-slate-900 hover:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-800 shadow-lg text-slate-300"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Neural_Export (.json)
            </button>

            {!wipeConfirm ? (
              <button
                onClick={() => setWipeConfirm(true)}
                className="px-6 py-3 bg-rose-950/20 hover:bg-rose-950/40 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-rose-900/50"
              >
                System_Wipe
              </button>
            ) : (
              <button
                onClick={() => { onSystemWipe(); setWipeConfirm(false); }}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-rose-600/30 animate-pulse"
              >
                CONFIRM_TOTAL_PURGE
              </button>
            )}
        </div>
      </section>
    </div>
  );
};

export default Settings;

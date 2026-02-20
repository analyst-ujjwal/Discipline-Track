
import React, { useState, useMemo } from 'react';
import { Habit, HabitLog, SkillArchetype } from '../types';
import { getTodayStr, formatDate } from '../utils/dateUtils';
import { calculateStreak } from '../utils/streakUtils';

interface HabitGridProps {
  habits: Habit[];
  logs: HabitLog[];
  onToggle: (habitId: string, date: string, completed: boolean) => void;
  onSaveNote: (habitId: string, date: string, note: string) => void;
}

const ARCHETYPE_COLORS: Record<SkillArchetype, string> = {
  PHYSICAL: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  MENTAL: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  TECHNICAL: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  SOCIAL: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  DISCIPLINE: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
};

type ViewMode = 'mission' | 'audit';

const HabitGrid: React.FC<HabitGridProps> = ({ habits, logs, onToggle, onSaveNote }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('mission');
  const [editingNote, setEditingNote] = useState<{ habitId: string; date: string } | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [filterStrict, setFilterStrict] = useState(false);
  const [energy, setEnergy] = useState<number>(3);
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

  const today = getTodayStr();
  const activeHabits = habits.filter(h => h.isActive && (!filterStrict || h.isStrict));
  
  const auditDates = useMemo(() => {
    const dts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dts.push(d.toISOString().split('T')[0]);
    }
    return dts;
  }, []);

  const getLog = (habitId: string, date: string) => {
    return logs.find(l => l.habitId === habitId && l.date === date);
  };

  const handleToggleInternal = (habitId: string, date: string, completed: boolean) => {
    if (completed) {
      setJustCompletedId(`${habitId}-${date}`);
      setTimeout(() => setJustCompletedId(null), 600);
    }
    onToggle(habitId, date, completed);
  };

  const startEditing = (habitId: string, date: string, initialValue: string = '') => {
    setEditingNote({ habitId, date });
    setTempNote(initialValue);
  };

  const finishEditing = () => {
    if (editingNote) {
      onSaveNote(editingNote.habitId, editingNote.date, tempNote);
      setEditingNote(null);
      setTempNote('');
    }
  };

  const todayStats = useMemo(() => {
    const todayLogs = logs.filter(l => l.date === today);
    const completed = todayLogs.filter(l => l.completed).length;
    const total = habits.filter(h => h.isActive).length;
    return { 
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      remaining: total - completed
    };
  }, [logs, today, habits]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase">Neural_Tracker</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-2 italic opacity-60">Strategic Log Acquisition</p>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-xl flex items-center gap-8 shadow-2xl">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Energy_Map</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(v => (
                  <button 
                    key={v}
                    onClick={() => setEnergy(v)}
                    className={`w-7 h-7 rounded-lg transition-all border ${energy >= v ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_10px_#6366f1]' : 'bg-slate-800 border-slate-700'}`}
                  />
                ))}
              </div>
           </div>
           
           <div className="w-px h-12 bg-slate-800"></div>

           <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Efficiency</span>
                  <span className="text-3xl font-black text-white tabular-nums tracking-tighter">{todayStats.percentage}%</span>
              </div>
              <div className="w-14 h-14 relative flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="28" cy="28" r="24" className="stroke-slate-800 fill-none" strokeWidth="4" />
                    <circle 
                      cx="28" cy="28" r="24" 
                      className="stroke-indigo-500 fill-none transition-all duration-1000" 
                      strokeWidth="4" 
                      strokeDasharray={150.7}
                      strokeDashoffset={150.7 - (150.7 * todayStats.percentage) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] font-black text-indigo-400">
                    {todayStats.remaining}
                  </div>
              </div>
           </div>
        </div>
      </header>

      {/* Mode & Filter Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/30 p-4 rounded-3xl border border-slate-800/50">
        <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800/50">
           <button 
              onClick={() => setViewMode('mission')}
              className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'mission' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             Active_Mission
           </button>
           <button 
              onClick={() => setViewMode('audit')}
              className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'audit' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             Registry_Audit
           </button>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/30">
           <button 
              onClick={() => setFilterStrict(false)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!filterStrict ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-400'}`}
           >
             All_Protocols
           </button>
           <button 
              onClick={() => setFilterStrict(true)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStrict ? 'bg-rose-900/30 text-rose-500 border border-rose-500/20' : 'text-slate-600 hover:text-slate-400'}`}
           >
             Strict_Only
           </button>
        </div>
      </div>

      {viewMode === 'mission' ? (
        /* Focused Today View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-8 duration-500">
          {activeHabits.length === 0 ? (
            <div className="col-span-full py-32 text-center text-slate-500 font-mono text-sm italic tracking-widest uppercase bg-slate-900/50 border border-slate-800/50 rounded-3xl">
              [ NO_PROTOCOLS_LOADED_FOR_TODAY ]
            </div>
          ) : (
            activeHabits.map(habit => {
              const log = getLog(habit.id, today);
              const completed = !!log?.completed;
              const hasNote = !!log?.note;
              const isJustCompleted = justCompletedId === `${habit.id}-${today}`;
              const archetypeClass = ARCHETYPE_COLORS[habit.archetype] || ARCHETYPE_COLORS.DISCIPLINE;
              const isEditing = editingNote?.habitId === habit.id && editingNote?.date === today;

              return (
                <div 
                  key={habit.id} 
                  className={`group relative bg-slate-900/50 border rounded-3xl p-8 transition-all duration-500 overflow-hidden ${
                    completed ? 'border-indigo-500/40 shadow-2xl shadow-indigo-600/10' : 'border-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  {completed && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />}
                  
                  <div className="flex justify-between items-start relative z-10 mb-6">
                    <div>
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 border rounded-lg inline-block mb-3 ${archetypeClass}`}>
                        {habit.archetype}
                      </span>
                      <h3 className={`text-2xl font-black tracking-tighter uppercase transition-all duration-500 ${completed ? 'text-indigo-400' : 'text-white'}`}>
                        {habit.name}
                      </h3>
                      {habit.scheduledTime && (
                        <p className="text-[10px] text-slate-500 font-black mt-1 tracking-[0.1em] uppercase">Window: {habit.scheduledTime}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleInternal(habit.id, today, !completed)}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 transform active:scale-90 shadow-lg ${
                        completed 
                          ? 'bg-indigo-600 text-white shadow-indigo-600/30' 
                          : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
                      } ${isJustCompleted ? 'animate-success-trigger' : ''}`}
                    >
                      <svg className={`w-8 h-8 transition-all duration-500 ${completed ? 'scale-100 rotate-0' : 'scale-75 opacity-20'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="relative z-10 space-y-4">
                     {isEditing ? (
                       <div className="animate-in fade-in duration-300">
                         <textarea
                            autoFocus
                            value={tempNote}
                            onChange={(e) => setTempNote(e.target.value)}
                            onBlur={finishEditing}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && finishEditing()}
                            className="w-full bg-slate-950 border border-indigo-500/50 text-[11px] p-4 rounded-2xl outline-none shadow-2xl font-mono text-indigo-300 min-h-[100px] resize-none"
                            placeholder="Enter execution reflection..."
                          />
                          <p className="text-[9px] text-slate-600 mt-2 italic">[ENTER] to confirm, [SHIFT+ENTER] for new line</p>
                       </div>
                     ) : (
                       <button
                         onClick={() => startEditing(habit.id, today, log?.note || '')}
                         className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                           hasNote 
                            ? 'bg-slate-950 border-indigo-500/20 text-slate-300' 
                            : 'bg-slate-900/50 border-slate-800/50 text-slate-600 hover:border-slate-700 group-hover:bg-slate-900/80'
                         }`}
                       >
                         <svg className="w-4 h-4 mt-0.5 shrink-0 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                         </svg>
                         <span className="text-xs font-medium leading-relaxed italic">
                           {log?.note || 'Add reflection log...'}
                         </span>
                       </button>
                     )}
                  </div>

                  <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-1000 opacity-0 group-hover:opacity-100" style={{ width: completed ? '100%' : '0%' }}></div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Registry Audit Grid View (Previous Logic) */
        <div className="overflow-hidden bg-slate-900/50 border border-slate-800/50 rounded-3xl shadow-3xl backdrop-blur-md animate-in slide-in-from-left-8 duration-500">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80">
                  <th className="p-8 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] min-w-[320px]">Protocol_Entity</th>
                  {auditDates.map(date => (
                    <th key={date} className="p-8 text-center text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] min-w-[120px]">
                      {date === today ? (
                        <span className="text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-xl border border-indigo-500/20 font-black">PRESENT</span>
                      ) : formatDate(date)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {activeHabits.length === 0 ? (
                  <tr>
                    <td colSpan={auditDates.length + 1} className="p-32 text-center text-slate-500 font-mono text-sm italic tracking-widest uppercase">
                      IDLE: No active protocols found in session.
                    </td>
                  </tr>
                ) : (
                  activeHabits.map(habit => {
                    const todayLog = getLog(habit.id, today);
                    const isStrictAndPending = habit.isStrict && !todayLog?.completed;
                    const archetypeClass = ARCHETYPE_COLORS[habit.archetype] || ARCHETYPE_COLORS.DISCIPLINE;

                    return (
                      <tr key={habit.id} className="group hover:bg-indigo-500/[0.03] transition-all duration-300">
                        <td className="p-8">
                          <div className="flex items-center gap-6">
                            <div className={`relative w-4 h-4 rounded-full shrink-0 ${habit.isStrict ? 'bg-rose-500' : 'bg-indigo-500'} ${isStrictAndPending ? 'animate-pulse-red' : ''}`}>
                              {isStrictAndPending && <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-60"></div>}
                            </div>
                            <div>
                              <div className="flex items-center gap-4">
                                <span className={`text-lg font-black tracking-tighter transition-all duration-500 uppercase ${isStrictAndPending ? 'text-rose-400' : 'text-slate-100'}`}>
                                  {habit.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-2">
                                 <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 border rounded-lg ${archetypeClass}`}>
                                   {habit.archetype}
                                 </span>
                                 {habit.isStrict && (
                                   <span className="text-[9px] text-rose-500 font-black uppercase tracking-[0.2em] px-2 py-1 border border-rose-500/20 rounded-lg">Strict</span>
                                 )}
                              </div>
                            </div>
                          </div>
                        </td>
                        {auditDates.map(date => {
                          const log = getLog(habit.id, date);
                          const completed = !!log?.completed;

                          return (
                            <td key={date} className="p-6 text-center relative group/cell">
                              <button
                                onClick={() => handleToggleInternal(habit.id, date, !completed)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 transform active:scale-90 ${
                                  completed 
                                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 scale-110' 
                                    : 'bg-slate-800 text-slate-700 hover:bg-slate-700 hover:text-slate-400 rotate-6 group-hover/cell:rotate-0'
                                }`}
                              >
                                <svg className={`w-6 h-6 transition-all duration-500 ${completed ? 'opacity-100 scale-100' : 'opacity-10 scale-50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Persistence Info Footer */}
      <footer className="p-10 bg-slate-950/80 border border-slate-800/50 rounded-3xl relative overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          <div className="p-4 bg-indigo-500/10 rounded-2xl shrink-0 border border-indigo-500/20 text-indigo-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3">Tactical Operational Brief</p>
            <p className="text-sm text-slate-500 leading-relaxed max-w-4xl font-medium italic opacity-80">
              "Focus execution on the <span className="text-indigo-400 font-black">Active Mission</span> window. Consistency in the current node cycle is the primary driver of neural plasticity. Use the <span className="text-slate-300 font-bold underline">Registry Audit</span> periodically to verify long-term synchronization stability."
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HabitGrid;

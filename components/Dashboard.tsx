
import React, { useMemo, useState, useEffect } from 'react';
import { Habit, HabitLog, View } from '../types';
import { getTodayStr, getDatesForRange, formatDate } from '../utils/dateUtils';
import { calculateStreak } from '../utils/streakUtils';
import { aiService } from '../services/aiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  habits: Habit[];
  logs: HabitLog[];
  onViewChange?: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ habits, logs, onViewChange }) => {
  const [aiReport, setAiReport] = useState<string>("INITIALIZING_SYSTEM_ANALYTICS...");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  
  const activeHabits = habits.filter(h => h.isActive);
  const today = getTodayStr();

  const metrics = useMemo(() => {
    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    // Find next protocol
    const upcoming = activeHabits
      .filter(h => h.scheduledTime && h.scheduledTime >= currentTimeStr)
      .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''))[0];
    
    const todayLogs = logs.filter(l => l.date === today);
    const completedToday = todayLogs.filter(l => l.completed).length;
    const dailyCompletion = activeHabits.length ? (completedToday / activeHabits.length) * 100 : 0;

    // Last 14 days chart data
    const last14Dates = getDatesForRange(14);
    const barData = last14Dates.map(date => {
      const dayLogs = logs.filter(l => l.date === date);
      const total = activeHabits.length;
      const completed = dayLogs.filter(l => l.completed).length;
      return {
        date: formatDate(date),
        percentage: total ? Math.round((completed / total) * 100) : 0,
        fullDate: date
      };
    });

    const heatmapDates = getDatesForRange(28);
    const heatmapData = heatmapDates.map(date => {
      const dayLogs = logs.filter(l => l.date === date);
      const rate = activeHabits.length ? dayLogs.filter(l => l.completed).length / activeHabits.length : 0;
      return { date, rate };
    });

    const habitStreaks = activeHabits.map(h => ({
      name: h.name,
      ...calculateStreak(h.id, logs)
    })).sort((a, b) => b.current - a.current);

    const maxStreak = habitStreaks.length > 0 ? Math.max(...habitStreaks.map(s => s.current)) : 0;

    const recentEvents = logs
      .filter(l => l.completed)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10)
      .map(l => {
        const habit = habits.find(h => h.id === l.habitId);
        return {
          id: l.id,
          text: `PROTOCOL_EXECUTED: ${habit?.name || 'UNKNOWN'}`,
          date: l.date,
          status: 'SUCCESS'
        };
      });

    return { dailyCompletion, barData, habitStreaks, maxStreak, upcoming, heatmapData, recentEvents };
  }, [habits, logs, today, activeHabits]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (metrics.upcoming?.scheduledTime) {
        const now = new Date();
        const [hours, minutes] = metrics.upcoming.scheduledTime.split(':').map(Number);
        const target = new Date();
        target.setHours(hours, minutes, 0, 0);
        
        const diff = target.getTime() - now.getTime();
        if (diff > 0) {
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        } else {
          setTimeLeft("00:00:00");
        }
      } else {
        setTimeLeft("--:--:--");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [metrics.upcoming]);

  useEffect(() => {
    const fetchAiAnalysis = async () => {
      if (logs.length === 0) return;
      setIsAiLoading(true);
      const report = await aiService.generateStatusReport(habits, logs);
      setAiReport(report);
      setIsAiLoading(false);
    };
    fetchAiAnalysis();
  }, [logs.length]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Systems_Core</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-1 italic">Tactical Awareness Hub</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural_Sync: OK</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Protocol Widget with Live Timer */}
        <div className="lg:col-span-2 relative group overflow-hidden bg-indigo-600 rounded-3xl p-8 flex flex-col justify-between min-h-[300px] shadow-2xl shadow-indigo-500/20 border border-indigo-400/20 transition-all duration-500 hover:scale-[1.01]">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
             <svg className="w-48 h-48 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4">Immediate objective</span>
              <div className="mono text-2xl font-black text-white/40 tracking-[0.2em]">{timeLeft}</div>
            </div>
            {metrics.upcoming ? (
              <>
                <h3 className="text-6xl font-black text-white mb-2 leading-none uppercase tracking-tighter">{metrics.upcoming.name}</h3>
                <p className="text-indigo-100 font-bold tracking-[0.3em] text-lg uppercase opacity-80">Window_Opens: {metrics.upcoming.scheduledTime}</p>
              </>
            ) : (
              <>
                <h3 className="text-5xl font-black text-white mb-2 leading-none uppercase tracking-tighter">Standby Mode</h3>
                <p className="text-indigo-100 font-bold tracking-[0.2em] text-lg uppercase opacity-80">Cycle_Complete: Prepare for Recharge</p>
              </>
            )}
          </div>
          <div className="relative z-10 flex items-center gap-6 pt-6">
             <button 
                onClick={() => onViewChange?.('tracking')}
                className="px-10 py-4 bg-white text-indigo-600 font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 transition-all active:scale-95 group-hover:shadow-white/20"
             >
               Execute Now
             </button>
             <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] border-l border-white/20 pl-6 space-y-1">
                <div>Encryption: v2.4_AES</div>
                <div>Status: Verified_Entity</div>
             </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col justify-center items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="text-8xl font-black text-white mb-2 tracking-tighter tabular-nums">{Math.round(metrics.dailyCompletion)}%</div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-8 italic">Cycle Efficiency Rating</p>
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 p-1">
               <div className="h-full bg-indigo-500 shadow-[0_0_20px_#6366f1] transition-all duration-1000 rounded-full" style={{ width: `${metrics.dailyCompletion}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-600 mt-6 uppercase font-black tracking-[0.4em] animate-pulse">Saturation_Warning: {metrics.dailyCompletion > 90 ? 'MAX_PERFORMANCE' : 'OPTIMIZING'}</p>
        </div>
      </div>

      <section className="bg-slate-950 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex items-start gap-8 relative z-10">
          <div className="mt-1 w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-lg group">
             <svg className={`w-6 h-6 text-indigo-400 ${isAiLoading ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4 flex items-center gap-4">
              AI_NEURAL_ANALYST
              {isAiLoading && <span className="inline-block w-2.5 h-2.5 bg-indigo-400 rounded-full animate-ping"></span>}
            </h4>
            <p className="text-lg text-slate-300 leading-relaxed font-mono italic opacity-90">
              "{aiReport}"
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Longest Chain', val: metrics.maxStreak, unit: 'Days', color: 'text-orange-500' },
          { label: 'Active Nodes', val: activeHabits.length, unit: 'Online', color: 'text-indigo-400' },
          { label: 'Neural Power', val: (metrics.dailyCompletion * 1.5).toFixed(0), unit: 'Ghz', color: 'text-emerald-400' },
          { label: 'System Load', val: metrics.dailyCompletion > 50 ? 'STABLE' : 'CRITICAL', unit: '', color: metrics.dailyCompletion > 50 ? 'text-emerald-500' : 'text-rose-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-slate-700 transition-all hover:-translate-y-2 cursor-pointer shadow-lg">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{stat.label}</p>
            <div className="flex items-baseline gap-3">
               <span className={`text-5xl font-black tracking-tighter tabular-nums ${stat.color}`}>{stat.val}</span>
               {stat.unit && <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{stat.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
              <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Performance_Timeline_v4.2</h3>
                <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-indigo-500/50"></div>
                   <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                </div>
              </div>
              <div className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={metrics.barData}>
                     <CartesianGrid strokeDasharray="6 6" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="date" stroke="#475569" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} tickMargin={10} />
                     <YAxis domain={[0, 100]} hide />
                     <Tooltip 
                       cursor={{fill: '#1e293b', radius: 16}}
                       contentStyle={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '20px', fontSize: '10px', fontWeight: '900', color: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                     />
                     <Bar dataKey="percentage" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40}>
                        {metrics.barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.percentage > 85 ? '#10b981' : '#6366f1'} opacity={0.9} />
                        ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
              </div>
           </section>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Discipline_Grid</h3>
                <div className="flex flex-wrap gap-3">
                   {metrics.heatmapData.map((d, i) => (
                     <div 
                       key={i} 
                       title={`${d.date}: ${Math.round(d.rate * 100)}%`}
                       className="w-9 h-9 rounded-xl transition-all hover:scale-150 hover:z-50 cursor-crosshair shadow-2xl border border-white/5"
                       style={{ 
                         backgroundColor: d.rate === 0 ? '#1e293b' : '#6366f1',
                         opacity: d.rate === 0 ? 1 : Math.max(0.4, d.rate)
                       }}
                     />
                   ))}
                </div>
                <div className="flex justify-between mt-8 border-t border-slate-800/50 pt-4">
                   <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Minimal_Sync</span>
                   <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Authorized_Link</span>
                </div>
             </section>

             <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl h-full">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 italic">Tactical_Mission_Log</h3>
                <div className="space-y-4 font-mono">
                   {metrics.recentEvents.map((ev, i) => (
                     <div key={i} className="flex items-center gap-4 text-[11px] group">
                        <span className="text-slate-600 font-bold shrink-0">[{ev.date.slice(-5)}]</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-slate-400 truncate tracking-tight group-hover:text-white transition-colors uppercase">{ev.text}</span>
                     </div>
                   ))}
                   {metrics.recentEvents.length === 0 && (
                     <p className="text-[11px] text-slate-600 italic font-mono">IDLE: AWAITING_PROTOCOLS...</p>
                   )}
                </div>
             </section>
           </div>
        </div>

        <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl h-fit sticky top-10 shadow-2xl">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12 border-b border-slate-800 pb-6">Ranking_Stability</h3>
          <div className="space-y-8">
            {metrics.habitStreaks.slice(0, 8).map((streak, i) => (
              <div key={streak.name} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-5">
                  <span className="text-[11px] font-black text-slate-800 font-mono tracking-tighter">NODE_{i+1}</span>
                  <div>
                    <p className="text-sm font-black text-slate-200 group-hover:text-indigo-400 transition-colors truncate max-w-[150px] uppercase tracking-tighter">{streak.name}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(Math.min(5, streak.current))].map((_, j) => (
                        <div key={j} className="w-1.5 h-1.5 rounded-full bg-orange-500/40"></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-[10px] font-black border tabular-nums transition-all ${streak.current > 0 ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : 'bg-slate-950 text-slate-700 border-slate-800'}`}>
                   {streak.current} 🔥
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

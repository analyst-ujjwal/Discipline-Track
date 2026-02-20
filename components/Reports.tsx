
import React, { useState, useEffect } from 'react';
import { MonthlyReport, User } from '../types';
import { habitService } from '../services/habitService';
import { getMonthStr } from '../utils/dateUtils';

interface ReportsProps {
  user: User;
}

const Reports: React.FC<ReportsProps> = ({ user }) => {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, [user.id]);

  const loadReports = async () => {
    const data = await habitService.getReports(user.id);
    setReports(data.sort((a, b) => b.month.localeCompare(a.month)));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    // Generate for previous month if not exists, or current for simulation
    const month = getMonthStr();
    await habitService.generateMonthlyReport(user.id, month);
    await loadReports();
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Archives</h2>
          <p className="text-slate-400">Long-term habit data persistence.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {generating ? 'Compiling...' : 'Generate Report'}
        </button>
      </header>

      {reports.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500">
          No reports generated yet. Compile your data at month end.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-lg text-indigo-400 uppercase tracking-widest">{report.month}</h3>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded border border-emerald-500/20">VERIFIED</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Efficiency</p>
                    <p className="text-2xl font-bold text-indigo-100">{report.avgCompletionRate}%</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Max Streak</p>
                    <p className="text-2xl font-bold text-indigo-100">{report.longestStreak}d</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/50 transition-colors">
                    <span className="text-sm text-slate-400">Peak Performance</span>
                    <span className="text-sm font-semibold text-emerald-400">{report.bestHabit}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/50 transition-colors">
                    <span className="text-sm text-slate-400">Regression Point</span>
                    <span className="text-sm font-semibold text-rose-400">{report.worstHabit}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  Link as LinkIcon,
  TrendingUp,
} from 'lucide-react';
import { DashboardSummary } from '@ai-study-planner/shared';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ summary, onRefresh }) => {
  const [copied, setCopied] = useState(false);

  if (!summary) {
    return (
      <div className="text-center py-24 text-slate-400">
        Loading analytics dashboard...
      </div>
    );
  }

  const handleCopyICS = () => {
    const url = `${window.location.origin}/api/calendar/feed.ics`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadICS = () => {
    window.open('/api/calendar/feed.ics', '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border shadow-sm bg-[#fbf8f2] dark:bg-[#121622] border-[#e6dece] dark:border-slate-800 transition-colors duration-200">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 text-xs font-condensed font-bold uppercase tracking-wider mb-1">
            <span>PERFORMANCE INTELLIGENCE</span>
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-[#181a1f] dark:text-white">
            Academic Velocity & Deadline Radar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of syllabus completion, habit consistency, and risk factors.
          </p>
        </div>

        {/* Calendar Sync Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadICS}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-[#ded5c6] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#181a1f] dark:text-slate-200 font-condensed font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
            title="Download .ics file for Google Calendar / Apple Calendar"
          >
            <Download className="w-3.5 h-3.5 text-[#1e5bb5]" />
            <span>Export .ICS</span>
          </button>

          <button
            onClick={handleCopyICS}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#1e5bb5] hover:bg-[#184992] text-white font-condensed font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Sync Calendar'}</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hours */}
        <div className="p-5 rounded-2xl border shadow-sm bg-[#fbf8f2] dark:bg-[#121622] border-[#e6dece] dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-condensed font-bold uppercase tracking-wider">
            <span>Hours Studied</span>
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-mono font-bold text-[#181a1f] dark:text-white">
            {summary.totalHoursStudied} <span className="text-xs font-sans text-slate-500">/ {summary.totalTargetHours}h</span>
          </div>
          <p className="text-[11px] text-slate-500">Actual deep work logged</p>
        </div>

        {/* Completion Rate */}
        <div className="p-5 rounded-2xl border shadow-sm bg-[#fbf8f2] dark:bg-[#121622] border-[#e6dece] dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-condensed font-bold uppercase tracking-wider">
            <span>Syllabus Progress</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {summary.completionRate}%
          </div>
          <p className="text-[11px] text-slate-500">Total curriculum completed</p>
        </div>

        {/* Habit Streak */}
        <div className="p-5 rounded-2xl border shadow-sm bg-[#fbf8f2] dark:bg-[#121622] border-[#e6dece] dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-condensed font-bold uppercase tracking-wider">
            <span>Study Streak</span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
              <Flame className="w-4 h-4 fill-current text-amber-500" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-mono font-bold text-amber-600 dark:text-amber-400">
            {summary.streakDays} Days
          </div>
          <p className="text-[11px] text-slate-500">Daily study habit consistency</p>
        </div>

        {/* Sessions Summary */}
        <div className="p-5 rounded-2xl border shadow-sm bg-[#fbf8f2] dark:bg-[#121622] border-[#e6dece] dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-condensed font-bold uppercase tracking-wider">
            <span>Sessions Status</span>
            <div className="p-1.5 rounded-lg bg-cyan-100 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-mono font-bold text-[#1e5bb5] dark:text-cyan-400">
            {summary.sessionsCompleted} <span className="text-xs font-sans text-slate-500">done • {summary.sessionsUpcoming} left</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {summary.sessionsSkipped} skipped (rescheduled)
          </p>
        </div>
      </div>

      {/* Deadline Health Radar Table */}
      <div className="p-6 rounded-3xl border shadow-sm bg-[#fbf8f2] dark:bg-[#121622] border-[#e6dece] dark:border-slate-800 space-y-4 transition-colors duration-200">
        <div>
          <h3 className="font-serif text-2xl font-bold tracking-tight text-[#181a1f] dark:text-white">
            Subject Health & Infeasibility Risk Radar
          </h3>
          <p className="text-xs text-slate-500">
            Compares remaining curriculum effort against available study windows before deadline.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e6dece] dark:border-slate-800 text-slate-500 uppercase font-condensed font-bold text-xs tracking-wider">
                <th className="pb-3 pl-2">Subject / Goal</th>
                <th className="pb-3">Health Status</th>
                <th className="pb-3">Progress</th>
                <th className="pb-3">Remaining Effort</th>
                <th className="pb-3">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6dece]/60 dark:divide-slate-800">
              {summary.goalStatuses.map((goal) => (
                <tr key={goal.goalId} className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-[#181a1f] dark:text-white flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: goal.color }}
                    />
                    <span>{goal.title}</span>
                  </td>

                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-condensed font-bold uppercase border ${
                        goal.risk === 'on-track'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : goal.risk === 'at-risk'
                          ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      {goal.risk.replace('-', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5">
                    <div className="w-28 bg-[#e6dece] dark:bg-slate-800 rounded-full h-2 overflow-hidden inline-block mr-2 align-middle">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${goal.progressPercent}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{goal.progressPercent}%</span>
                  </td>

                  <td className="py-3.5 font-mono text-slate-700 dark:text-slate-300">
                    {goal.requiredHoursRemaining} Hours
                  </td>

                  <td className="py-3.5 text-slate-500 font-mono">
                    {goal.deadline.split('T')[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

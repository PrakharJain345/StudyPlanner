import React, { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Layers,
  Play,
  RefreshCw,
  RotateCcw,
  SkipForward,
  Sparkles,
  Star,
  Target,
} from 'lucide-react';
import { Goal, Session } from '@ai-study-planner/shared';
import { format, isSameDay, parseISO } from 'date-fns';

interface TodayViewProps {
  sessions: Session[];
  goals: Goal[];
  onStartSession: (session: Session) => void;
  onUpdateStatus: (
    sessionId: string,
    status: 'done' | 'pending' | 'partial' | 'skipped',
    actualMinutes?: number
  ) => void;
  onTriggerReplan: () => void;
  hasReplanAlert: boolean;
  streakDays: number;
}

export const TodayView: React.FC<TodayViewProps> = ({
  sessions,
  goals,
  onStartSession,
  onUpdateStatus,
  onTriggerReplan,
  hasReplanAlert,
  streakDays,
}) => {
  const today = new Date();
  const goalMap = new Map<string, Goal>(goals.map((g) => [g.id, g]));

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<string>('all');

  // Filter sessions for today
  const todaySessions = sessions.filter((s) => isSameDay(parseISO(s.start), today));
  const completedToday = todaySessions.filter((s) => s.status === 'done');
  const pendingToday = todaySessions.filter((s) => s.status === 'pending');
  const skippedToday = todaySessions.filter((s) => s.status === 'skipped');

  const totalMinutesAllocated = todaySessions.length * 50;
  const totalMinutesDone = completedToday.reduce((sum, s) => sum + (s.actualMinutes || 50), 0);
  const hoursDone = Math.round((totalMinutesDone / 60) * 10) / 10;
  const targetHours = Math.round((totalMinutesAllocated / 60) * 10) / 10;
  const progressPercent =
    todaySessions.length > 0
      ? Math.round((completedToday.length / todaySessions.length) * 100)
      : 0;

  // Filtered list
  const filteredSessions = todaySessions
    .filter((s) => {
      if (statusFilter === 'pending') return s.status === 'pending';
      if (statusFilter === 'done') return s.status === 'done';
      return true; // 'all'
    })
    .filter((s) => {
      if (selectedGoalFilter === 'all') return true;
      return s.goalId === selectedGoalFilter;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fadeIn font-sans">
      {/* 1. STRUCTURED DAILY DASHBOARD & PROGRESS HEADER */}
      <div className="rounded-3xl p-6 md:p-8 border shadow-sm bg-[#fbf8f2] dark:bg-[#121622] border-[#e6dece] dark:border-slate-800 transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#e6dece] dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-[#1e5bb5] dark:text-cyan-400 text-xs font-medium uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(today, 'EEEE, MMMM d, yyyy')}</span>
              <span>•</span>
              <span>Adaptive Study Horizon</span>
            </div>
            <h2 className="font-space font-medium text-2xl md:text-3xl tracking-tight text-[#181a1f] dark:text-white">
              Today's Study Plan & Tasks
            </h2>
            <p className="text-xs md:text-sm text-[#5a5448] dark:text-slate-300 mt-1">
              Mark tasks completed as you study. Your schedule automatically recalculates if sessions are skipped or delayed.
            </p>
          </div>

          {/* Metric Badges */}
          <div className="flex items-center space-x-3 sm:space-x-4 bg-[#f1ebd0]/60 dark:bg-slate-900/90 p-3 rounded-2xl border border-[#ded5c6] dark:border-slate-800 shrink-0">
            {/* Hours */}
            <div className="text-center px-2.5 sm:px-3 border-r border-[#ded5c6] dark:border-slate-800">
              <span className="text-lg sm:text-xl font-mono font-bold text-[#181a1f] dark:text-white">
                {hoursDone} <span className="text-xs text-slate-500 font-sans">/ {targetHours}h</span>
              </span>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Hours Done</p>
            </div>

            {/* Tasks Completed */}
            <div className="text-center px-2.5 sm:px-3 border-r border-[#ded5c6] dark:border-slate-800">
              <span className="text-lg sm:text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {completedToday.length} <span className="text-xs text-slate-500 font-sans">/ {todaySessions.length}</span>
              </span>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Tasks Done</p>
            </div>

            {/* Habit Streak */}
            <div className="text-center px-2.5 sm:px-3">
              <div className="flex items-center justify-center space-x-1">
                <Flame className="w-4 h-4 text-amber-500 fill-current animate-pulse" />
                <span className="text-lg sm:text-xl font-mono font-bold text-amber-600 dark:text-amber-400">
                  {streakDays}d
                </span>
              </div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Habit Streak</p>
            </div>
          </div>
        </div>

        {/* Live Completion Progress Bar */}
        <div className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
              <span>Daily Completion Rate</span>
              <span className="font-mono font-bold text-[#181a1f] dark:text-white">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#ebe3d5] dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1e5bb5] via-indigo-600 to-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-slate-500 shrink-0">
            {pendingToday.length > 0 ? (
              <span>{pendingToday.length} sessions remaining today</span>
            ) : todaySessions.length > 0 ? (
              <span className="text-emerald-600 font-medium">All tasks completed today! 🎉</span>
            ) : (
              <span>No tasks scheduled</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. PLAN ACCORDINGLY & ADAPTIVE RE-PLAN CONTROL */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
        hasReplanAlert
          ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40'
          : 'bg-[#fcfaf5] dark:bg-[#121622] border-[#ded5c6] dark:border-slate-800'
      }`}>
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            hasReplanAlert
              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30'
              : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30'
          }`}>
            {hasReplanAlert ? <AlertCircle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-space font-medium text-sm md:text-base text-[#181a1f] dark:text-white flex items-center space-x-2">
              <span>{hasReplanAlert ? 'Adaptive Schedule Adjustment Recommended' : 'Schedule is Optimized & On Track'}</span>
              {hasReplanAlert && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                  Action Needed
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-xl">
              {hasReplanAlert
                ? 'One or more tasks were skipped or adjusted. Run an adaptive re-plan to redistribute hours into open buffer slots with zero deadline slips.'
                : 'All planned sessions fit within your availability. You can adjust your timetable anytime life plans change.'}
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerReplan}
          className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-xs uppercase tracking-wider transition-all shadow-md shrink-0 hover:scale-105 active:scale-95 ${
            hasReplanAlert
              ? 'bg-gradient-to-r from-amber-600 to-[#c0392b] text-white shadow-amber-600/30'
              : 'bg-[#181a1f] dark:bg-slate-700 hover:bg-black text-white shadow-slate-900/20'
          }`}
          title="Recalculate adaptive study schedule"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${hasReplanAlert ? 'animate-spin' : ''}`} />
          <span>{hasReplanAlert ? 'Run Adaptive Re-Plan' : 'Optimize Schedule'}</span>
        </button>
      </div>

      {/* 3. STRUCTURED TASK CONTROLS & FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Status Filter Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-[#ebe3d5]/70 dark:bg-slate-900/70 border border-[#ded5c6] dark:border-slate-800 text-xs font-medium shadow-inner">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-800 text-[#181a1f] dark:text-white font-semibold shadow-sm'
                : 'text-[#5a5447] dark:text-slate-400 hover:text-[#181a1f]'
            }`}
          >
            <span>All Tasks</span>
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-mono">
              {todaySessions.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === 'pending'
                ? 'bg-white dark:bg-slate-800 text-[#1e5bb5] dark:text-cyan-400 font-semibold shadow-sm'
                : 'text-[#5a5447] dark:text-slate-400 hover:text-[#181a1f]'
            }`}
          >
            <span>To Do</span>
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-mono">
              {pendingToday.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('done')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === 'done'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm'
                : 'text-[#5a5447] dark:text-slate-400 hover:text-[#181a1f]'
            }`}
          >
            <span>Completed</span>
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-mono">
              {completedToday.length}
            </span>
          </button>
        </div>

        {/* Goal Filter Dropdown */}
        {goals.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Subject:</span>
            </span>
            <select
              value={selectedGoalFilter}
              onChange={(e) => setSelectedGoalFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#ded5c6] dark:border-slate-800 bg-[#fbf8f2] dark:bg-slate-900 text-xs font-medium text-[#181a1f] dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Subjects ({goals.length})</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 4. TASK LIST (Interactive Checkboxes: Mark Completed or Not Completed) */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="rounded-3xl p-12 text-center border bg-[#fbf8f2] dark:bg-[#121622] border-[#e6dece] dark:border-slate-800 text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3 opacity-60" />
            <h4 className="font-space font-medium text-base text-[#181a1f] dark:text-white">
              {statusFilter === 'pending'
                ? 'No pending tasks left for today!'
                : statusFilter === 'done'
                ? 'No completed tasks yet today. Check off a task to get started!'
                : 'No study sessions scheduled for today.'}
            </h4>
            <p className="text-xs mt-1 text-slate-500">
              {statusFilter === 'all'
                ? 'Enjoy your free time or add a custom study block in the calendar.'
                : 'Switch filters or view your full 7-day schedule.'}
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const goal = goalMap.get(session.goalId);
            const isDone = session.status === 'done';
            const isSkipped = session.status === 'skipped';
            const startTimeStr = format(parseISO(session.start), 'h:mm a');
            const endTimeStr = format(parseISO(session.end), 'h:mm a');

            return (
              <div
                key={session.id}
                className={`relative overflow-hidden rounded-2xl p-4 md:p-5 transition-all border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDone
                    ? 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/15'
                    : isSkipped
                    ? 'border-rose-300 dark:border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/15 opacity-75'
                    : 'border-[#e6dece] dark:border-slate-800 hover:border-[#1e5bb5]/50 bg-[#fbf8f2] dark:bg-[#141824]'
                }`}
              >
                {/* Left Goal Color Accent Bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: goal?.color || '#1e5bb5' }}
                />

                {/* Left Group: Checkbox + Task Information */}
                <div className="flex items-start sm:items-center space-x-3.5 pl-1.5 flex-1 min-w-0">
                  {/* INTERACTIVE CHECKBOX: Click to toggle Completed <-> Pending */}
                  <button
                    onClick={() =>
                      onUpdateStatus(session.id, isDone ? 'pending' : 'done', 50)
                    }
                    className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all shrink-0 mt-0.5 sm:mt-0 ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                        : isSkipped
                        ? 'bg-rose-100 border-rose-300 text-rose-600 hover:bg-rose-200'
                        : 'border-[#ded5c6] dark:border-slate-700 bg-white dark:bg-slate-800 text-transparent hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                    }`}
                    title={isDone ? 'Click to uncheck (mark not completed)' : 'Click to mark as completed'}
                    aria-label={isDone ? 'Mark as Not Completed' : 'Mark as Completed'}
                  >
                    {isDone ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : isSkipped ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4 opacity-0 hover:opacity-100" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Time */}
                      <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{startTimeStr} – {endTimeStr}</span>
                      </span>

                      {/* Session Type Pill */}
                      <span
                        className={`text-[10px] uppercase font-medium px-2 py-0.5 rounded-full border ${
                          session.type === 'learn'
                            ? 'bg-blue-100 dark:bg-indigo-500/20 text-blue-800 dark:text-indigo-300 border-blue-200 dark:border-indigo-500/30'
                            : session.type === 'practice'
                            ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30'
                            : session.type === 'revise'
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                            : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                        }`}
                      >
                        {session.type}
                      </span>

                      {/* Goal Subject Tag */}
                      {goal && (
                        <span
                          className="text-xs font-medium truncate max-w-[200px]"
                          style={{ color: goal.color }}
                        >
                          {goal.title}
                        </span>
                      )}
                    </div>

                    {/* Task Title */}
                    <h4
                      className={`text-sm sm:text-base font-medium transition-all ${
                        isDone
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : isSkipped
                          ? 'text-rose-800 dark:text-rose-300'
                          : 'text-[#181a1f] dark:text-white'
                      }`}
                    >
                      {session.title}
                    </h4>

                    {/* Notes / Ratings if done */}
                    {isDone && (
                      <div className="flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-400 pt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed (logged {session.actualMinutes || 50}m)</span>
                        {session.confidence && (
                          <div className="flex items-center space-x-0.5 ml-2 text-amber-500">
                            {[1, 2, 3, 4, 5].map((st) => (
                              <Star
                                key={st}
                                className={`w-3 h-3 ${st <= session.confidence! ? 'fill-current' : 'text-slate-300'}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Skipped alert */}
                    {isSkipped && (
                      <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center space-x-1.5 pt-0.5">
                        <span>Session was skipped. Re-plan will safely route topics to buffer slots.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Suite */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center pl-10 md:pl-0">
                  {/* If not done & not skipped: Start Focus Button */}
                  {!isDone && !isSkipped && (
                    <button
                      onClick={() => onStartSession(session)}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#1e5bb5] hover:bg-[#184992] text-white font-medium text-xs uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95"
                      title="Start interactive focus timer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Focus</span>
                    </button>
                  )}

                  {/* Skip Button (to trigger adaptive redistribution) */}
                  {!isDone && !isSkipped && (
                    <button
                      onClick={() => onUpdateStatus(session.id, 'skipped')}
                      className="px-2.5 py-1.5 rounded-xl border border-[#ded5c6] dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-600 text-xs font-medium transition-all"
                      title="Skip session — triggers adaptive buffer re-plan"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* If done: Unmark / Restore Button */}
                  {isDone && (
                    <button
                      onClick={() => onUpdateStatus(session.id, 'pending')}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition-all"
                      title="Mark as not completed"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Unmark</span>
                    </button>
                  )}

                  {/* If skipped: Restore to Pending Button */}
                  {isSkipped && (
                    <button
                      onClick={() => onUpdateStatus(session.id, 'pending')}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium transition-all hover:bg-rose-100"
                      title="Restore session back to to-do list"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

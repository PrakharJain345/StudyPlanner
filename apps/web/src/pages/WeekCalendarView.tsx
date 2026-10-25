import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { Goal, Session } from '@ai-study-planner/shared';
import {
  addDays,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
  subDays,
} from 'date-fns';

interface WeekCalendarViewProps {
  sessions: Session[];
  goals: Goal[];
  onSelectSession: (session: Session) => void;
  onUpdateStatus?: (
    sessionId: string,
    status: 'done' | 'pending' | 'partial' | 'skipped',
    actualMinutes?: number
  ) => void;
}

export const WeekCalendarView: React.FC<WeekCalendarViewProps> = ({
  sessions,
  goals,
  onSelectSession,
  onUpdateStatus,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const goalMap = new Map<string, Goal>(goals.map((g) => [g.id, g]));
  const days = [0, 1, 2, 3, 4, 5, 6].map((offset) => addDays(currentWeekStart, offset));

  const handlePrevWeek = () => setCurrentWeekStart((prev) => subDays(prev, 7));
  const handleNextWeek = () => setCurrentWeekStart((prev) => addDays(prev, 7));
  const handleToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 animate-fadeIn font-sans">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border shadow-sm bg-[#fbf8f2] dark:bg-[#121622] border-[#e6dece] dark:border-slate-800 transition-colors duration-200">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#b85412]/15 border border-[#b85412]/30 flex items-center justify-center text-[#b85412]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-space font-medium text-2xl tracking-tight text-[#181a1f] dark:text-white">
              {format(days[0], 'MMMM d')} – {format(days[6], 'MMMM d, yyyy')}
            </h2>
            <p className="text-xs text-slate-500">7-Day Master Study Horizon • Click checkbox to mark tasks completed or pending</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 rounded-lg border border-[#ded5c6] dark:border-slate-700 bg-[#eae3d5]/70 dark:bg-slate-800 hover:bg-[#ded5c6] text-xs font-medium text-[#181a1f] dark:text-slate-200 transition-all"
          >
            Today
          </button>
          <button
            onClick={handlePrevWeek}
            className="p-1.5 rounded-lg border border-[#ded5c6] dark:border-slate-700 bg-[#eae3d5]/70 dark:bg-slate-800 hover:bg-[#ded5c6] text-slate-700 dark:text-slate-300 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-1.5 rounded-lg border border-[#ded5c6] dark:border-slate-700 bg-[#eae3d5]/70 dark:bg-slate-800 hover:bg-[#ded5c6] text-slate-700 dark:text-slate-300 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Day Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {days.map((day) => {
          const isToday = isSameDay(day, new Date());
          const daySessions = sessions
            .filter((s) => isSameDay(parseISO(s.start), day))
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

          return (
            <div
              key={day.toISOString()}
              className={`rounded-2xl p-3.5 flex flex-col min-h-[460px] border shadow-sm transition-all ${
                isToday
                  ? 'border-[#1e5bb5] bg-[#eef4ff]/70 dark:bg-[#121c2d] ring-1 ring-[#1e5bb5]/30'
                  : 'border-[#e6dece] dark:border-slate-800 bg-[#fbf8f2] dark:bg-[#121622]'
              }`}
            >
              {/* Day Header */}
              <div className="pb-3 border-b border-[#e6dece] dark:border-slate-800 mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-condensed font-extrabold uppercase tracking-wider text-slate-500">
                    {format(day, 'EEE')}
                  </div>
                  <div
                    className={`text-xl font-serif font-bold leading-none mt-0.5 ${
                      isToday ? 'text-[#1e5bb5] dark:text-cyan-400' : 'text-[#181a1f] dark:text-white'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                </div>

                {isToday && (
                  <span className="text-[9px] font-condensed font-extrabold px-1.5 py-0.5 rounded bg-[#1e5bb5] text-white">
                    TODAY
                  </span>
                )}
              </div>

              {/* Sessions in day */}
              <div className="flex-1 space-y-2 overflow-y-auto">
                {daySessions.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-[11px] text-slate-400 italic py-8">
                    No study scheduled
                  </div>
                ) : (
                  daySessions.map((session) => {
                    const goal = goalMap.get(session.goalId);
                    const isDone = session.status === 'done';
                    const isSkipped = session.status === 'skipped';
                    const timeStr = `${format(parseISO(session.start), 'h:mm')} - ${format(
                      parseISO(session.end),
                      'h:mm a'
                    )}`;

                    return (
                      <div
                        key={session.id}
                        onClick={() => onSelectSession(session)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.02] shadow-sm relative group ${
                          isDone
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30 text-slate-500'
                            : isSkipped
                            ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30 text-slate-400 line-through'
                            : 'bg-white dark:bg-slate-800 border-[#ded5c6] dark:border-slate-700 text-[#181a1f] dark:text-slate-100 hover:border-[#1e5bb5]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 gap-1">
                          <span className="text-[10px] font-mono font-medium text-slate-500">
                            {timeStr}
                          </span>
                          <div className="flex items-center space-x-1.5">
                            <span
                              className="text-[9px] font-medium uppercase px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: `${goal?.color || '#1e5bb5'}18`,
                                color: goal?.color || '#1e5bb5',
                              }}
                            >
                              {session.type}
                            </span>
                            {onUpdateStatus && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateStatus(session.id, isDone ? 'pending' : 'done', 50);
                                }}
                                className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                  isDone
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-transparent hover:border-emerald-500 hover:text-emerald-500'
                                }`}
                                title={isDone ? 'Mark as Not Completed' : 'Mark as Completed'}
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className={`font-medium line-clamp-2 ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                          {session.title}
                        </div>

                        {goal && (
                          <div
                            className="text-[10px] font-medium truncate mt-1"
                            style={{ color: goal.color }}
                          >
                            {goal.title}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

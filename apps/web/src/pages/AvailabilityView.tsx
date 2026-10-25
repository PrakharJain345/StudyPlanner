import React, { useState } from 'react';
import {
  CalendarX,
  Clock,
  Plus,
  Save,
  Trash2,
  Zap,
} from 'lucide-react';
import { AvailabilitySlot, BlockedDate, UserPreferences } from '@ai-study-planner/shared';
import { format, parseISO } from 'date-fns';

interface AvailabilityViewProps {
  availability: AvailabilitySlot[];
  blockedDates: BlockedDate[];
  preferences: UserPreferences | null;
  onSaveAvailability: (slots: Omit<AvailabilitySlot, 'id' | 'userId'>[]) => void;
  onAddBlockedDate: (blocked: Omit<BlockedDate, 'id' | 'userId'>) => void;
  onDeleteBlockedDate: (id: string) => void;
  onSavePreferences: (prefs: Partial<UserPreferences>) => void;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const AvailabilityView: React.FC<AvailabilityViewProps> = ({
  availability,
  blockedDates,
  preferences,
  onSaveAvailability,
  onAddBlockedDate,
  onDeleteBlockedDate,
  onSavePreferences,
}) => {
  const [slotsState, setSlotsState] = useState<Omit<AvailabilitySlot, 'id' | 'userId'>[]>(
    availability.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    }))
  );

  const [blockedReason, setBlockedReason] = useState('');
  const [blockedStartDate, setBlockedStartDate] = useState('');
  const [blockedEndDate, setBlockedEndDate] = useState('');

  const [sessionLen, setSessionLen] = useState(preferences?.sessionLength || 50);
  const [maxHours, setMaxHours] = useState(preferences?.maxHoursPerDay || 6);
  const [peakTime, setPeakTime] = useState(preferences?.preferredTimeOfDay || 'evening');

  const toggleDaySlot = (dayIndex: number) => {
    const exists = slotsState.some((s) => s.dayOfWeek === dayIndex);
    if (exists) {
      setSlotsState((prev) => prev.filter((s) => s.dayOfWeek !== dayIndex));
    } else {
      setSlotsState((prev) => [
        ...prev,
        { dayOfWeek: dayIndex, startTime: '17:00', endTime: '21:00' },
      ]);
    }
  };

  const updateSlotTimes = (dayIndex: number, start: string, end: string) => {
    setSlotsState((prev) =>
      prev.map((s) =>
        s.dayOfWeek === dayIndex ? { ...s, startTime: start, endTime: end } : s
      )
    );
  };

  const handleSaveSlots = () => {
    onSaveAvailability(slotsState);
    alert('Weekly study schedule saved!');
  };

  const handleCreateBlockedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockedReason || !blockedStartDate || !blockedEndDate) return;

    onAddBlockedDate({
      reason: blockedReason,
      startDate: `${blockedStartDate}T00:00:00.000Z`,
      endDate: `${blockedEndDate}T23:59:59.000Z`,
    });

    setBlockedReason('');
    setBlockedStartDate('');
    setBlockedEndDate('');
  };

  const handleUpdatePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences({
      sessionLength: sessionLen,
      maxHoursPerDay: maxHours,
      preferredTimeOfDay: peakTime,
    });
    alert('Study preferences updated!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn font-sans">
      {/* Header */}
      <div className="p-6 rounded-3xl border shadow-sm bg-[#fbf8f2] dark:bg-[#121622] border-[#e6dece] dark:border-slate-800 transition-colors duration-200">
        <div className="flex items-center space-x-2 text-[#181a1f] dark:text-slate-300 text-xs font-condensed font-bold uppercase tracking-wider mb-1">
          <span>TIME AVAILABILITY & BOUNDARIES</span>
        </div>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#181a1f] dark:text-white">
          Weekly Study Slots & Schedule Constraints
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure recurring study hours, energy chronotypes, and vacation/blocked dates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Weekly Recurring Slots */}
        <div className="lg:col-span-2 p-6 rounded-3xl border shadow-sm bg-[#fbf8f2] dark:bg-[#121622] border-[#e6dece] dark:border-slate-800 space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#e6dece] dark:border-slate-800">
            <div>
              <h3 className="font-serif text-2xl font-bold tracking-tight text-[#181a1f] dark:text-white">
                Weekly Recurring Study Slots
              </h3>
              <p className="text-xs text-slate-500">Enable study days and calibrate dedicated hours</p>
            </div>
            <button
              onClick={handleSaveSlots}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1e5bb5] hover:bg-[#184992] text-white font-condensed font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Schedule</span>
            </button>
          </div>

          <div className="space-y-3">
            {DAYS_OF_WEEK.map((dayName, idx) => {
              const activeSlot = slotsState.find((s) => s.dayOfWeek === idx);
              const isActive = !!activeSlot;

              return (
                <div
                  key={dayName}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                    isActive
                      ? 'bg-white dark:bg-slate-800/80 border-[#ded5c6] dark:border-slate-700'
                      : 'bg-[#f5f0e8]/40 dark:bg-slate-900/40 border-[#e6dece] dark:border-slate-800/70 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleDaySlot(idx)}
                      className="accent-[#1e5bb5] w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="font-bold text-[#181a1f] dark:text-white text-sm w-28">{dayName}</span>
                  </div>

                  {isActive ? (
                    <div className="flex items-center space-x-2 text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="time"
                        value={activeSlot.startTime}
                        onChange={(e) =>
                          updateSlotTimes(idx, e.target.value, activeSlot.endTime)
                        }
                        className="bg-[#faf6ef] dark:bg-slate-900 border border-[#ded5c6] dark:border-slate-700 rounded-lg px-2.5 py-1 text-[#181a1f] dark:text-white font-mono"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="time"
                        value={activeSlot.endTime}
                        onChange={(e) =>
                          updateSlotTimes(idx, activeSlot.startTime, e.target.value)
                        }
                        className="bg-[#faf6ef] dark:bg-slate-900 border border-[#ded5c6] dark:border-slate-700 rounded-lg px-2.5 py-1 text-[#181a1f] dark:text-white font-mono"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No study blocks scheduled</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Preferences & Blocked Dates */}
        <div className="space-y-6">
          {/* Study Preferences Card */}
          <div className="p-6 rounded-3xl border shadow-sm bg-[#fbf8f2] dark:bg-[#121622] border-[#e6dece] dark:border-slate-800 space-y-4 transition-colors duration-200">
            <h3 className="font-serif text-xl font-bold tracking-tight text-[#181a1f] dark:text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Study Engine Calibration</span>
            </h3>

            <form onSubmit={handleUpdatePrefs} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Session Duration ({sessionLen}m)
                </label>
                <select
                  value={sessionLen}
                  onChange={(e) => setSessionLen(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 border border-[#ded5c6] dark:border-slate-700 rounded-xl p-2.5 text-[#181a1f] dark:text-white"
                >
                  <option value={25}>25 Minutes (Standard Pomodoro)</option>
                  <option value={50}>50 Minutes (University Lecture / Deep Work)</option>
                  <option value={90}>90 Minutes (Intensive Practice / Mock Exams)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Max Daily Limit ({maxHours} Hours)
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={maxHours}
                  onChange={(e) => setMaxHours(Number(e.target.value))}
                  className="w-full accent-[#1e5bb5] cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Peak Mental Energy (Chronotype)
                </label>
                <select
                  value={peakTime}
                  onChange={(e) => setPeakTime(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-800 border border-[#ded5c6] dark:border-slate-700 rounded-xl p-2.5 text-[#181a1f] dark:text-white"
                >
                  <option value="morning">Morning Lark (6 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="evening">Evening (5 PM - 10 PM)</option>
                  <option value="night">Night Owl (10 PM - 2 AM)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#181a1f] dark:bg-slate-700 text-white font-condensed font-bold text-xs uppercase tracking-wider transition-all"
              >
                Save Preferences
              </button>
            </form>
          </div>

          {/* Blocked Dates */}
          <div className="p-6 rounded-3xl border shadow-sm bg-[#fbf8f2] dark:bg-[#121622] border-[#e6dece] dark:border-slate-800 space-y-4 transition-colors duration-200">
            <h3 className="font-serif text-xl font-bold tracking-tight text-[#181a1f] dark:text-white flex items-center space-x-2">
              <CalendarX className="w-4 h-4 text-[#c0392b]" />
              <span>Blocked Dates & Events</span>
            </h3>

            <form onSubmit={handleCreateBlockedDate} className="space-y-2.5 text-xs">
              <input
                type="text"
                required
                value={blockedReason}
                onChange={(e) => setBlockedReason(e.target.value)}
                placeholder="Reason (e.g. Midterms, College Fest, Travel)"
                className="w-full bg-white dark:bg-slate-800 border border-[#ded5c6] dark:border-slate-700 rounded-xl p-2.5 text-[#181a1f] dark:text-white placeholder:text-slate-400"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={blockedStartDate}
                  onChange={(e) => setBlockedStartDate(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-[#ded5c6] dark:border-slate-700 rounded-xl p-2 text-[#181a1f] dark:text-white"
                />
                <input
                  type="date"
                  required
                  value={blockedEndDate}
                  onChange={(e) => setBlockedEndDate(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-[#ded5c6] dark:border-slate-700 rounded-xl p-2 text-[#181a1f] dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#c0392b] hover:bg-[#a82d20] text-white font-condensed font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Blocked Date</span>
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {blockedDates.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic text-center py-2">
                  No blocked dates configured.
                </p>
              ) : (
                blockedDates.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-[#ded5c6] dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#181a1f] dark:text-white">{b.reason}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {format(parseISO(b.startDate), 'MMM d')} – {format(parseISO(b.endDate), 'MMM d')}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteBlockedDate(b.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

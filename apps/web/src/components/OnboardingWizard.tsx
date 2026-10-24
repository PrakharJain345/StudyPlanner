import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  Loader2,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { AvailabilitySlot, GoalType, UserPreferences } from '@ai-study-planner/shared';
import { api } from '../api/client';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const PRESET_PROGRAMS = [
  {
    id: 'cs_semester',
    title: 'Computer Science Semester',
    description: 'Data Structures, Operating Systems, Machine Learning with realistic deadlines and difficulty.',
    badge: 'Popular',
  },
  {
    id: 'gate_cat',
    title: 'Competitive Exam / Placement Track',
    description: 'Intense problem solving track with spaced revision and high-weight topics.',
    badge: 'Intense',
  },
  {
    id: 'fullstack',
    title: 'Full Stack Engineering Bootcamp',
    description: 'React, Node/Express, PostgreSQL, System Design & portfolio project.',
    badge: 'Practical',
  },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [selectedProgram, setSelectedProgram] = useState('cs_semester');
  const [availabilityPreset, setAvailabilityPreset] = useState('evenings');
  const [sessionDuration, setSessionDuration] = useState(50);
  const [peakTime, setPeakTime] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('evening');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. Update user preferences
      await api.updatePreferences({
        sessionLength: sessionDuration,
        preferredTimeOfDay: peakTime,
        breakLength: 10,
        maxHoursPerDay: 5,
        daysOff: [0],
        bufferPercent: 15,
      });

      // 2. Setup preset availability
      let slots: Omit<AvailabilitySlot, 'id' | 'userId'>[] = [];
      if (availabilityPreset === 'evenings') {
        slots = [1, 2, 3, 4, 5].map((day) => ({
          dayOfWeek: day,
          startTime: '17:00',
          endTime: '21:00',
        }));
        slots.push({ dayOfWeek: 6, startTime: '10:00', endTime: '15:00' });
      } else if (availabilityPreset === 'fulltime') {
        slots = [1, 2, 3, 4, 5, 6].map((day) => ({
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '15:00',
        }));
      } else {
        slots = [1, 3, 5].map((day) => ({
          dayOfWeek: day,
          startTime: '18:00',
          endTime: '21:00',
        }));
        slots.push({ dayOfWeek: 6, startTime: '10:00', endTime: '16:00' });
      }

      await api.setAvailability(slots);

      // 3. Reset or populate fresh demo data based on preset
      await api.resetDemo();

      // 4. Generate plan
      await api.generatePlan();

      onComplete();
      onClose();
    } catch (err: any) {
      alert(`Setup error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl glass-panel bg-slate-900/95 rounded-2xl border border-slate-700/80 p-6 md:p-8 shadow-2xl glow-primary">
        {/* Step indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/40 glow-primary scale-110'
                    : step > s
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
            ))}
            <span className="text-xs text-slate-400 ml-2 font-medium">
              Step {step} of 3
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps */}
        <div className="py-6 min-h-[300px]">
          {step === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-1">Select Your Academic Program</h2>
              <p className="text-xs text-slate-400 mb-5">
                Choose a baseline curriculum structure. You can customize, add, or delete subjects anytime.
              </p>

              <div className="space-y-3">
                {PRESET_PROGRAMS.map((prog) => (
                  <div
                    key={prog.id}
                    onClick={() => setSelectedProgram(prog.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedProgram === prog.id
                        ? 'bg-brand-950/40 border-brand-500/80 shadow-md shadow-brand-500/20 glow-primary'
                        : 'bg-slate-800/40 border-slate-700/70 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-sm">{prog.title}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {prog.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{prog.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-1">Set Weekly Availability</h2>
              <p className="text-xs text-slate-400 mb-5">
                When do you have dedicated blocks for deep study? The scheduler will never exceed your limits.
              </p>

              <div className="space-y-3">
                <div
                  onClick={() => setAvailabilityPreset('evenings')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    availabilityPreset === 'evenings'
                      ? 'bg-brand-950/40 border-brand-500/80 glow-primary'
                      : 'bg-slate-800/40 border-slate-700/70 hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold text-white text-sm mb-0.5">
                    College Evenings + Saturday (Recommended)
                  </div>
                  <p className="text-xs text-slate-400">
                    Mon–Fri: 17:00 – 21:00 (4h/day) + Sat: 10:00 – 15:00. Sundays free.
                  </p>
                </div>

                <div
                  onClick={() => setAvailabilityPreset('fulltime')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    availabilityPreset === 'fulltime'
                      ? 'bg-brand-950/40 border-brand-500/80 glow-primary'
                      : 'bg-slate-800/40 border-slate-700/70 hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold text-white text-sm mb-0.5">
                    Full-Time Exam Prep (6h/day)
                  </div>
                  <p className="text-xs text-slate-400">
                    Mon–Sat: 09:00 – 15:00. Highest weekly velocity with buffer days.
                  </p>
                </div>

                <div
                  onClick={() => setAvailabilityPreset('working')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    availabilityPreset === 'working'
                      ? 'bg-brand-950/40 border-brand-500/80 glow-primary'
                      : 'bg-slate-800/40 border-slate-700/70 hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold text-white text-sm mb-0.5">
                    Light Pace / Side Learner
                  </div>
                  <p className="text-xs text-slate-400">
                    3 weekdays (18:00 – 21:00) + Saturday intensive block.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-1">Study Preferences & Chronotype</h2>
              <p className="text-xs text-slate-400 mb-5">
                The scheduler places challenging concepts when your energy is highest.
              </p>

              <div className="space-y-4">
                {/* Session Length */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Preferred Session Duration: {sessionDuration} Minutes
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[25, 50, 90].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setSessionDuration(dur)}
                        className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          sessionDuration === dur
                            ? 'bg-brand-600 border-brand-500 text-white shadow-md shadow-brand-600/30'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        {dur}m {dur === 25 ? '(Pomodoro)' : dur === 50 ? '(Standard)' : '(Deep Work)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Peak study chronotype */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Peak Mental Energy Time
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {[
                      { id: 'morning', label: '🌅 Morning Lark (6 AM - 12 PM)' },
                      { id: 'afternoon', label: '☀️ Afternoon (12 PM - 5 PM)' },
                      { id: 'evening', label: '🌆 Evening (5 PM - 10 PM)' },
                      { id: 'night', label: '🌙 Night Owl (10 PM - 2 AM)' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setPeakTime(t.id as any)}
                        className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                          peakTime === t.id
                            ? 'bg-brand-950/50 border-brand-500 text-brand-300 glow-primary'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 glow-primary transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 glow-primary transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Generate Adaptive Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

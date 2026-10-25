import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  HelpCircle,
  Layers,
  Lightbulb,
  Play,
  RefreshCw,
  Sliders,
  Sparkles,
  Target,
  X,
} from 'lucide-react';

interface AppGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'today' | 'week' | 'goals' | 'availability' | 'dashboard') => void;
  onOpenAddGoal: () => void;
  onOpenReplan: () => void;
}

export const AppGuideModal: React.FC<AppGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenAddGoal,
  onOpenReplan,
}) => {
  if (!isOpen) return null;

  const [activeStep, setActiveStep] = useState<number>(1);

  const guideSteps = [
    {
      step: 1,
      title: 'Goals & Syllabus Breakdown',
      tabKey: 'goals' as const,
      icon: Target,
      color: '#c0392b',
      tagline: 'Step 1: Set your destination',
      summary: 'Add your college courses, semester exams, or competitive prep goals. Paste any raw syllabus outline and AI automatically extracts modules, difficulty weights, and estimated study hours.',
      keyActions: [
        'Click "+ Add Goal" in the top bar to create a subject.',
        'Paste course outlines to let AI generate your study modules.',
        'Set target exam deadlines so the engine calibrates required hours.',
      ],
      ctaLabel: 'Go to Goals & Syllabus',
      ctaAction: () => {
        onNavigateTab('goals');
        onClose();
      },
    },
    {
      step: 2,
      title: 'Weekly Availability & Calendar',
      tabKey: 'availability' as const,
      icon: Calendar,
      color: '#b85412',
      tagline: 'Step 2: Define when you can study',
      summary: 'Tell PlanMind which days and hours you are available. Block out lecture slots, gym hours, or vacation days. The engine creates a personalized 7-day schedule with built-in buffer protection.',
      keyActions: [
        'Set weekly study hours in the "Availability" tab.',
        'Block specific exam dates or holidays to avoid scheduling conflicts.',
        'Review your balanced timetable in the "7-Day Calendar" view.',
      ],
      ctaLabel: 'View 7-Day Calendar',
      ctaAction: () => {
        onNavigateTab('week');
        onClose();
      },
    },
    {
      step: 3,
      title: 'Daily Tasks & Checkboxes',
      tabKey: 'today' as const,
      icon: CheckCircle2,
      color: '#1e5bb5',
      tagline: 'Step 3: Execute and track daily progress',
      summary: 'Your "Today" tab is your structured daily focus dashboard. Every study session has an interactive checkbox so you can easily mark tasks completed (or unmark them if plans change).',
      keyActions: [
        'Click the Checkbox on any task to instantly mark it Completed or To Do.',
        'Click "▶ Start Focus" to launch a Pomodoro focus timer with ambient sound.',
        'Filter tasks by "To Do", "Completed", or filter by specific subjects.',
      ],
      ctaLabel: "Go to Today's Tasks",
      ctaAction: () => {
        onNavigateTab('today');
        onClose();
      },
    },
    {
      step: 4,
      title: 'Adaptive Re-Planning',
      tabKey: 'today' as const,
      icon: RefreshCw,
      color: '#ea580c',
      tagline: 'Step 4: Life happens — adapt with 1 click',
      summary: 'Missed a study block or had unexpected college events? No problem. PlanMind is an adaptive deterministic scheduler. Click Re-Plan to automatically shift remaining work into buffer slots with zero deadline slips.',
      keyActions: [
        'If a session is missed or skipped, an alert will notify you.',
        'Click "⚡ Re-Plan" in the workspace header to recalculate remaining hours.',
        'Review the visual diff and apply the new schedule with zero stress.',
      ],
      ctaLabel: 'Explore Adaptive Re-Plan',
      ctaAction: () => {
        onOpenReplan();
        onClose();
      },
    },
  ];

  const currentStep = guideSteps.find((s) => s.step === activeStep) || guideSteps[0];
  const IconComponent = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="relative w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden bg-[#faf7f0] dark:bg-[#0f1422] border-[#ded5c6] dark:border-slate-800 text-[#181a1f] dark:text-slate-100 transition-colors duration-200">
        {/* Top Header */}
        <div className="p-6 md:p-7 border-b border-[#e5dcce] dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-medium uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Quick Navigation & Workflow Guide
                </span>
              </div>
              <h2 className="font-space font-medium text-xl md:text-2xl tracking-tight text-[#181a1f] dark:text-white">
                How PlanMind AI Works
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-[#ded5c6] dark:border-slate-800 hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-[#181a1f] dark:hover:text-white transition-colors"
            aria-label="Close guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Step Selector Ribbon */}
        <div className="grid grid-cols-4 border-b border-[#e5dcce] dark:border-slate-800 bg-[#f4ebe0]/60 dark:bg-slate-900/50">
          {guideSteps.map((s) => {
            const StepIcon = s.icon;
            const isSelected = s.step === activeStep;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`py-3.5 px-2 flex flex-col sm:flex-row items-center justify-center sm:space-x-2 border-b-2 text-center transition-all ${
                  isSelected
                    ? 'border-[#1e5bb5] bg-white dark:bg-slate-800/90 text-[#1e5bb5] dark:text-cyan-400 font-semibold shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                  isSelected
                    ? 'bg-[#1e5bb5] text-white dark:bg-cyan-500 dark:text-slate-950'
                    : 'bg-black/10 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                }`}>
                  {s.step}
                </span>
                <span className="text-xs truncate max-w-[120px] hidden sm:inline">
                  {s.title.split(' ')[0]} {s.title.split(' ')[1] || ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step Body Content */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${currentStep.color}15`,
                  color: currentStep.color,
                }}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{currentStep.tagline}</span>
              </div>

              <h3 className="font-space font-medium text-2xl tracking-tight text-[#181a1f] dark:text-white">
                {currentStep.title}
              </h3>

              <p className="text-sm text-[#5a5447] dark:text-slate-300 leading-relaxed">
                {currentStep.summary}
              </p>
            </div>

            {/* Visual Step Illustration Card */}
            <div className="w-full md:w-64 p-4 rounded-2xl border bg-white dark:bg-slate-900 border-[#e5dcce] dark:border-slate-800 shadow-sm shrink-0">
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-2">
                Quick Action Highlights
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {currentStep.keyActions.map((action, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick App Navigation Sitemap */}
          <div className="p-4 rounded-2xl bg-[#eee7da]/60 dark:bg-slate-900/40 border border-[#ded5c6] dark:border-slate-800">
            <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center space-x-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Navigation Quick Map:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-[#ded5c6] dark:border-slate-700 text-center">
                <div className="font-semibold text-[#1e5bb5] dark:text-cyan-400">1. Today</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tasks & Checkbox</div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-[#ded5c6] dark:border-slate-700 text-center">
                <div className="font-semibold text-[#b85412] dark:text-orange-400">2. Calendar</div>
                <div className="text-[10px] text-slate-500 mt-0.5">7-Day Schedule</div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-[#ded5c6] dark:border-slate-700 text-center">
                <div className="font-semibold text-[#c0392b] dark:text-rose-400">3. Goals & Syllabus</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Courses & Outline</div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-[#ded5c6] dark:border-slate-700 text-center">
                <div className="font-semibold text-slate-800 dark:text-slate-200">4. Availability</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Study Slots</div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-[#ded5c6] dark:border-slate-700 text-center col-span-2 sm:col-span-1">
                <div className="font-semibold text-emerald-700 dark:text-emerald-400">5. Analytics</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Radar & Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="p-5 md:p-6 border-t border-[#e5dcce] dark:border-slate-800 bg-[#f4ebe0]/40 dark:bg-slate-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className="px-3.5 py-2 rounded-xl border border-[#ded5c6] dark:border-slate-700 disabled:opacity-40 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setActiveStep((prev) => Math.min(4, prev + 1))}
              disabled={activeStep === 4}
              className="px-3.5 py-2 rounded-xl border border-[#ded5c6] dark:border-slate-700 disabled:opacity-40 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              Next Step
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
            >
              Close
            </button>

            <button
              onClick={currentStep.ctaAction}
              className="px-5 py-2 rounded-xl bg-[#181a1f] dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white text-xs font-medium flex items-center space-x-1.5 shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <span>{currentStep.ctaLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

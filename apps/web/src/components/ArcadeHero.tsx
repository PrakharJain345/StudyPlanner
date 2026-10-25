import React from 'react';
import {
  BarChart3,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  Flame,
  HelpCircle,
  Moon,
  Plus,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  Target,
  Trophy,
} from 'lucide-react';

interface ArcadeHeroProps {
  onSelectMode: (mode: 'schedule' | 'syllabus' | 'timer') => void;
  onOpenSchedule: () => void;
  onOpenCopilot: () => void;
  onOpenReplan: () => void;
  onOpenAddGoal: () => void;
  onOpenGuide: () => void;
  onResetDemo: () => void;
  streakDays: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const ArcadeHero: React.FC<ArcadeHeroProps> = ({
  onSelectMode,
  onOpenSchedule,
  onOpenCopilot,
  onOpenReplan,
  onOpenAddGoal,
  onOpenGuide,
  onResetDemo,
  streakDays,
  isDarkMode,
  onToggleDarkMode,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="w-full font-sans transition-colors duration-200">
      {/* MAIN TOP NAVIGATION BAR (Clean, Well-Planned & Relevant Sections Only) */}
      <header className={`w-full border-b transition-colors duration-200 sticky top-0 z-40 backdrop-blur-md ${
        isDarkMode
          ? 'bg-[#0f131c]/95 border-slate-800 text-slate-100'
          : 'bg-[#f5f0e8]/95 border-[#e5dcce] text-[#181a1f]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* 1. Brand Logo Anchor */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer select-none group shrink-0"
            onClick={() => {
              setActiveTab('today');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1e5bb5] via-indigo-600 to-[#c0392b] p-[1.5px] shadow-sm group-hover:scale-105 transition-transform">
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isDarkMode ? 'bg-[#0f131c]' : 'bg-[#faf6ef]'}`}>
                <Brain className="w-5 h-5 text-[#c0392b]" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight leading-none text-[#181a1f] dark:text-white flex items-center font-space">
                Plan<span className="text-[#c0392b] ml-0.5">Mind</span>
                <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wider rounded bg-[#c0392b]/10 text-[#c0392b] border border-[#c0392b]/20">
                  AI
                </span>
              </div>
              <div className="text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400 mt-0.5">
                Adaptive Study Planner
              </div>
            </div>
          </div>

          {/* 2. Primary Navigation Links (Clean Segmented Pill Group - Relevant Sections Only) */}
          <nav className="hidden lg:flex items-center p-1 rounded-2xl bg-[#ebe3d5]/70 dark:bg-slate-900/70 border border-[#ded5c6] dark:border-slate-800/80 shadow-inner">
            <button
              onClick={() => {
                setActiveTab('today');
                onOpenSchedule();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all duration-150 ${
                activeTab === 'today'
                  ? 'bg-white dark:bg-slate-800 text-[#1e5bb5] dark:text-cyan-400 font-bold shadow-sm'
                  : 'text-[#5a5447] dark:text-slate-400 hover:text-[#181a1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Today</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('week');
                onOpenSchedule();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all duration-150 ${
                activeTab === 'week'
                  ? 'bg-white dark:bg-slate-800 text-[#b85412] dark:text-orange-400 font-bold shadow-sm'
                  : 'text-[#5a5447] dark:text-slate-400 hover:text-[#181a1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('goals');
                onOpenSchedule();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all duration-150 ${
                activeTab === 'goals'
                  ? 'bg-white dark:bg-slate-800 text-[#c0392b] dark:text-rose-400 font-bold shadow-sm'
                  : 'text-[#5a5447] dark:text-slate-400 hover:text-[#181a1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Goals & Syllabus</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('availability');
                onOpenSchedule();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all duration-150 ${
                activeTab === 'availability'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold shadow-sm'
                  : 'text-[#5a5447] dark:text-slate-400 hover:text-[#181a1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Availability</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('dashboard');
                onOpenSchedule();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all duration-150 ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm'
                  : 'text-[#5a5447] dark:text-slate-400 hover:text-[#181a1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* 3. Right Action & Status Suite */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
            {/* Streak Counter */}
            <div
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold ${
                isDarkMode
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                  : 'border-amber-500/30 bg-amber-100/60 text-amber-800'
              }`}
              title={`${streakDays} Day Study Streak`}
            >
              <Flame className="w-3.5 h-3.5 fill-current text-amber-500 animate-pulse" />
              <span>{streakDays}d Streak</span>
            </div>

            {/* App Guide Action */}
            <button
              onClick={onOpenGuide}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-50/70 hover:bg-indigo-100/70 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-all shadow-sm hover:scale-105 active:scale-95"
              title="Open Navigation & Workflow Guide"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>App Guide</span>
            </button>

            {/* AI Copilot Action */}
            <button
              onClick={onOpenCopilot}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm hover:scale-105 active:scale-95"
              title="Open AI Study Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>AI Copilot</span>
            </button>

            {/* Primary Action: + Add Goal */}
            <button
              onClick={onOpenAddGoal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#c0392b] hover:bg-[#a82d20] text-white text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
              title="Create a new study goal or course"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Goal</span>
            </button>

            {/* Divider */}
            <div className="h-5 w-[1px] bg-[#ded5c6] dark:border-slate-800 mx-0.5" />

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                isDarkMode
                  ? 'border-slate-700 bg-slate-800/80 text-amber-400 hover:bg-slate-700'
                  : 'border-[#ded5c6] bg-[#ebe3d5]/70 text-[#464136] hover:bg-[#ded5c6]'
              }`}
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={onResetDemo}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                isDarkMode
                  ? 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'border-[#ded5c6] text-[#716b5f] hover:text-[#181a1f] hover:bg-[#eae3d5]'
              }`}
              title="Reset sample college semester data"
              aria-label="Reset demo data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (Enriched with subtle transparent architectural study background) */}
      <section
        className={`relative w-full pt-14 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start border-b transition-colors duration-200 overflow-hidden ${
          isDarkMode ? 'border-slate-800/80 bg-[#080b12]' : 'border-[#e5dcce] bg-[#f5f0e8]'
        }`}
      >
        {/* Subtle Transparent Background Image to eliminate the empty look while keeping text 100% legible */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0">
          <img
            src="/assets/arena-bg.jpg"
            alt="Study Arena Background"
            className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
              isDarkMode
                ? 'opacity-20 filter brightness-75 contrast-125'
                : 'opacity-25 filter saturate-[0.8] contrast-105'
            }`}
          />
          {/* Top-to-bottom soft gradient fade matching the header and workspace */}
          <div
            className={`absolute inset-0 transition-colors duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-b from-[#0f131c]/70 via-transparent to-[#080b12]'
                : 'bg-gradient-to-b from-[#f5f0e8]/75 via-transparent to-[#f5f0e8]'
            }`}
          />
          {/* Radial soft glow behind the central headline for optimal contrast */}
          <div
            className={`absolute inset-0 transition-colors duration-300 ${
              isDarkMode
                ? 'bg-[radial-gradient(ellipse_at_50%_30%,rgba(8,11,18,0.7)_0%,transparent_70%)]'
                : 'bg-[radial-gradient(ellipse_at_50%_30%,rgba(245,240,232,0.75)_0%,transparent_70%)]'
            }`}
          />
        </div>

        {/* Subtle ethereal ambient glow behind the headline for depth */}
        <div className={`absolute top-8 w-2/3 max-w-2xl h-44 rounded-full blur-3xl pointer-events-none opacity-40 transition-opacity z-0 ${
          isDarkMode ? 'bg-indigo-900/30' : 'bg-amber-100/60'
        }`} />

        {/* Main Headline with Refined, Lighter Typography & Dynamic Weight Hierarchy */}
        <div className="relative z-10 max-w-5xl w-full text-center mb-12">
          <h1 className="font-space text-4xl sm:text-6xl md:text-7xl lg:text-[74px] tracking-tight leading-[1.04]">
            <span className="font-light block text-[#181a1f] dark:text-slate-100">
              Three Smart Study Engines
            </span>
            <span className="block mt-1 font-light sm:font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#c0392b] via-[#ea580c] to-[#b85412] dark:from-rose-400 dark:via-orange-400 dark:to-amber-400">
              One Master Plan
            </span>
          </h1>

          {/* Subtitle with lighter, cleaner typography */}
          <p
            className="mt-6 text-sm md:text-base max-w-2xl mx-auto font-sans font-light md:font-normal text-[#5a5447] dark:text-slate-300 leading-relaxed"
          >
            Master <span className="font-medium text-[#181a1f] dark:text-white">Semester Finals</span>,{' '}
            <span className="font-medium text-[#181a1f] dark:text-white">DSA & Competitive Prep</span>, and{' '}
            <span className="font-medium text-[#181a1f] dark:text-white">Capstone Projects</span> with an adaptive deterministic scheduler that automatically re-plans when life happens.
          </p>

          {/* Interactive Quick App Guide Strip right at the start */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-2 rounded-2xl border bg-[#fbf8f2]/90 dark:bg-slate-900/90 backdrop-blur-md border-[#ded5c6] dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>App Guide:</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
              <span
                onClick={() => {
                  setActiveTab('goals');
                  onOpenSchedule();
                }}
                className="cursor-pointer hover:text-indigo-600 dark:hover:text-cyan-400 font-medium transition-colors"
                title="1. Add Goals & Syllabus"
              >
                1. Goals & Syllabus
              </span>
              <span>➔</span>
              <span
                onClick={() => {
                  setActiveTab('week');
                  onOpenSchedule();
                }}
                className="cursor-pointer hover:text-indigo-600 dark:hover:text-cyan-400 font-medium transition-colors"
                title="2. 7-Day Calendar"
              >
                2. Calendar
              </span>
              <span>➔</span>
              <span
                onClick={() => {
                  setActiveTab('today');
                  onOpenSchedule();
                }}
                className="cursor-pointer hover:text-indigo-600 dark:hover:text-cyan-400 font-medium transition-colors"
                title="3. Today's Tasks"
              >
                3. Daily Tasks
              </span>
              <span>➔</span>
              <span
                onClick={onOpenReplan}
                className="cursor-pointer hover:text-indigo-600 dark:hover:text-cyan-400 font-medium transition-colors"
                title="4. Adaptive Re-Plan"
              >
                4. Re-Plan
              </span>
            </div>
            <button
              onClick={onOpenGuide}
              className="ml-1 px-3 py-1 rounded-xl bg-[#181a1f] dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white text-xs font-medium flex items-center space-x-1 transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Open full interactive navigation guide"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Full Guide</span>
            </button>
          </div>
        </div>

        {/* 4. THE THREE RELEVANT STUDY CARDS */}
        <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 px-2">
          {/* CARD 1: ADAPTIVE SCHEDULE (The Chase / Sprint) */}
          <div className={`rounded-[32px] overflow-hidden border p-6 flex flex-col items-center text-center shadow-lg hover:-translate-y-1.5 transition-all duration-300 ${
            isDarkMode
              ? 'bg-[#141824]/90 hover:bg-[#141824] border-slate-700/80 hover:shadow-[0_20px_50px_rgba(30,91,181,0.25)]'
              : 'bg-[#fcfaf5] hover:bg-white border-[#ded5c6] hover:shadow-[0_20px_50px_rgba(30,91,181,0.15)]'
          }`}>
            {/* Character Splatter Artwork */}
            <div className={`w-full h-56 flex items-center justify-center overflow-hidden rounded-2xl mb-4 p-2 border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-[#f4ebe0]/50 border-[#e5dcce]'
            }`}>
              <img
                src="/assets/card-sprint.jpg"
                alt="Adaptive Schedule"
                className="max-h-full max-w-full object-contain filter drop-shadow-md"
              />
            </div>

            {/* Category Sub-Tag */}
            <div className="font-sans font-medium text-[11px] uppercase tracking-[0.2em] text-[#1e5bb5] mb-1">
              Dynamic Timetable
            </div>

            {/* Modern Card Title */}
            <h2 className={`font-space font-medium text-2xl md:text-3xl tracking-tight leading-snug mb-1 ${
              isDarkMode ? 'text-white' : 'text-[#14161b]'
            }`}>
              The Adaptive Engine
            </h2>

            {/* Format Subtitle */}
            <div className={`text-xs font-normal tracking-wide mb-3 ${
              isDarkMode ? 'text-slate-400' : 'text-[#716b5f]'
            }`}>
              Automatic catch-up & buffer recovery
            </div>

            {/* Teaser Description */}
            <p className={`font-sans text-xs md:text-sm font-light md:font-normal mb-6 leading-relaxed ${
              isDarkMode ? 'text-slate-300' : 'text-[#524d42]'
            }`}>
              Missed a session? The engine automatically re-routes future hours into buffer slots with zero deadline slips.
            </p>

            {/* CTA Button */}
            <div className="mt-auto w-full flex justify-center">
              <button
                onClick={() => onSelectMode('schedule')}
                className="w-48 py-2.5 px-6 rounded-full bg-[#1e5bb5] hover:bg-[#184992] text-white font-medium text-xs uppercase tracking-wider shadow-md shadow-blue-600/30 flex items-center justify-center space-x-1.5 transition-all transform hover:scale-105"
              >
                <span>OPEN SCHEDULE</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* CARD 2: AI SYLLABUS BREAKDOWN (Algorithm Dynasty / Curriculum) */}
          <div className={`rounded-[32px] overflow-hidden border p-6 flex flex-col items-center text-center shadow-lg hover:-translate-y-1.5 transition-all duration-300 ${
            isDarkMode
              ? 'bg-[#141824]/90 hover:bg-[#141824] border-slate-700/80 hover:shadow-[0_20px_50px_rgba(184,84,18,0.25)]'
              : 'bg-[#fcfaf5] hover:bg-white border-[#ded5c6] hover:shadow-[0_20px_50px_rgba(184,84,18,0.15)]'
          }`}>
            {/* Character Splatter Artwork */}
            <div className={`w-full h-56 flex items-center justify-center overflow-hidden rounded-2xl mb-4 p-2 border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-[#f4ebe0]/50 border-[#e5dcce]'
            }`}>
              <img
                src="/assets/card-dsa.jpg"
                alt="AI Syllabus Breakdown"
                className="max-h-full max-w-full object-contain filter drop-shadow-md"
              />
            </div>

            {/* Category Sub-Tag */}
            <div className="font-sans font-medium text-[11px] uppercase tracking-[0.2em] text-[#b85412] mb-1">
              Curriculum Synthesis
            </div>

            {/* Modern Card Title */}
            <h2 className={`font-space font-medium text-2xl md:text-3xl tracking-tight leading-snug mb-1 ${
              isDarkMode ? 'text-white' : 'text-[#14161b]'
            }`}>
              Syllabus Breakdown
            </h2>

            {/* Format Subtitle */}
            <div className={`text-xs font-normal tracking-wide mb-3 ${
              isDarkMode ? 'text-slate-400' : 'text-[#716b5f]'
            }`}>
              Raw outline → effort calibration
            </div>

            {/* Teaser Description */}
            <p className={`font-sans text-xs md:text-sm font-light md:font-normal mb-6 leading-relaxed ${
              isDarkMode ? 'text-slate-300' : 'text-[#524d42]'
            }`}>
              Paste any university syllabus or exam outline. AI extracts modules, difficulty ratings, and realistic study hours.
            </p>

            {/* CTA Button */}
            <div className="mt-auto w-full flex justify-center">
              <button
                onClick={() => onSelectMode('syllabus')}
                className="w-48 py-2.5 px-6 rounded-full bg-[#b85412] hover:bg-[#97440d] text-white font-medium text-xs uppercase tracking-wider shadow-md shadow-orange-600/30 flex items-center justify-center space-x-1.5 transition-all transform hover:scale-105"
              >
                <span>IMPORT SYLLABUS</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* CARD 3: DEEP WORK FOCUS TIMER & SPACED REVISION */}
          <div className={`rounded-[32px] overflow-hidden border p-6 flex flex-col items-center text-center shadow-lg hover:-translate-y-1.5 transition-all duration-300 ${
            isDarkMode
              ? 'bg-[#141824]/90 hover:bg-[#141824] border-slate-700/80 hover:shadow-[0_20px_50px_rgba(192,57,43,0.25)]'
              : 'bg-[#fcfaf5] hover:bg-white border-[#ded5c6] hover:shadow-[0_20px_50px_rgba(192,57,43,0.15)]'
          }`}>
            {/* Character Splatter Artwork */}
            <div className={`w-full h-56 flex items-center justify-center overflow-hidden rounded-2xl mb-4 p-2 border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-[#f4ebe0]/50 border-[#e5dcce]'
            }`}>
              <img
                src="/assets/card-test.jpg"
                alt="Deep Focus Timer"
                className="max-h-full max-w-full object-contain filter drop-shadow-md"
              />
            </div>

            {/* Category Sub-Tag */}
            <div className="font-sans font-medium text-[11px] uppercase tracking-[0.2em] text-[#c0392b] mb-1">
              Retention Mastery
            </div>

            {/* Modern Card Title */}
            <h2 className={`font-space font-medium text-2xl md:text-3xl tracking-tight leading-snug mb-1 ${
              isDarkMode ? 'text-white' : 'text-[#14161b]'
            }`}>
              Deep Focus Timer
            </h2>

            {/* Format Subtitle */}
            <div className={`text-xs font-normal tracking-wide mb-3 ${
              isDarkMode ? 'text-slate-400' : 'text-[#716b5f]'
            }`}>
              Pomodoro + Spaced Repetition (+1, +3, +7d)
            </div>

            {/* Teaser Description */}
            <p className={`font-sans text-xs md:text-sm font-light md:font-normal mb-6 leading-relaxed ${
              isDarkMode ? 'text-slate-300' : 'text-[#524d42]'
            }`}>
              Focus sessions log actual time spent and self-confidence ratings, feeding automated spaced memory reviews.
            </p>

            {/* CTA Button */}
            <div className="mt-auto w-full flex justify-center">
              <button
                onClick={() => onSelectMode('timer')}
                className="w-48 py-2.5 px-6 rounded-full bg-[#c0392b] hover:bg-[#9e2e22] text-white font-medium text-xs uppercase tracking-wider shadow-md shadow-red-600/30 flex items-center justify-center space-x-1.5 transition-all transform hover:scale-105"
              >
                <span>START FOCUS</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

import React from 'react';
import {
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  LayoutDashboard,
  MessageSquareCode,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';

export type ActiveTab = 'today' | 'week' | 'goals' | 'availability' | 'dashboard' | 'assistant';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  streakDays: number;
  hasReplanAlert: boolean;
  onOpenReplan: () => void;
  onOpenAddGoal: () => void;
  onOpenOnboarding: () => void;
  onResetDemo: () => void;
  userName: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  streakDays,
  hasReplanAlert,
  onOpenReplan,
  onOpenAddGoal,
  onOpenOnboarding,
  onResetDemo,
  userName,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('today')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 p-[1.5px] glow-primary">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Brain className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg tracking-tight text-white">PlanMind</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Adaptive Study Planner</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'today'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Today</span>
            </button>

            <button
              onClick={() => setActiveTab('week')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'week'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Week View</span>
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'goals'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Goals & Syllabus</span>
            </button>

            <button
              onClick={() => setActiveTab('availability')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'availability'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Availability</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'assistant'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse-subtle" />
              <span>AI Copilot</span>
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center space-x-3">
            {/* Streak Counter */}
            <div className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-400">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30 animate-pulse-subtle" />
              <span>{streakDays}d Streak</span>
            </div>

            {/* Re-plan Alert Button */}
            {hasReplanAlert ? (
              <button
                onClick={onOpenReplan}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg shadow-rose-500/20 animate-bounce"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Adaptive Re-Plan</span>
              </button>
            ) : (
              <button
                onClick={onOpenReplan}
                className="flex items-center space-x-1 text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-all"
                title="Review schedule or trigger re-plan"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Re-Plan</span>
              </button>
            )}

            {/* Add Goal Button */}
            <button
              onClick={onOpenAddGoal}
              className="flex items-center space-x-1 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md shadow-brand-600/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Goal</span>
            </button>

            {/* Reset / Demo options */}
            <button
              onClick={onResetDemo}
              className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1.5 rounded hover:bg-slate-800 transition-all"
              title="Reset to pristine sample semester data"
            >
              Reset Demo
            </button>

            {/* Onboarding Wizard shortcut */}
            <button
              onClick={onOpenOnboarding}
              className="text-indigo-400 hover:text-indigo-300 text-xs px-2 py-1.5 rounded hover:bg-indigo-950/40 border border-indigo-500/30 transition-all"
              title="Start Onboarding Wizard"
            >
              Wizard
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 py-2 bg-slate-950/90 text-xs">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center py-1 ${activeTab === 'today' ? 'text-brand-400 font-bold' : 'text-slate-400'}`}
        >
          <CheckCircle2 className="w-4 h-4 mb-0.5" />
          <span>Today</span>
        </button>
        <button
          onClick={() => setActiveTab('week')}
          className={`flex flex-col items-center py-1 ${activeTab === 'week' ? 'text-brand-400 font-bold' : 'text-slate-400'}`}
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          <span>Week</span>
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex flex-col items-center py-1 ${activeTab === 'goals' ? 'text-brand-400 font-bold' : 'text-slate-400'}`}
        >
          <Target className="w-4 h-4 mb-0.5" />
          <span>Goals</span>
        </button>
        <button
          onClick={() => setActiveTab('availability')}
          className={`flex flex-col items-center py-1 ${activeTab === 'availability' ? 'text-brand-400 font-bold' : 'text-slate-400'}`}
        >
          <Clock className="w-4 h-4 mb-0.5" />
          <span>Times</span>
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 ${activeTab === 'dashboard' ? 'text-brand-400 font-bold' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Stats</span>
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex flex-col items-center py-1 ${activeTab === 'assistant' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span>AI</span>
        </button>
      </div>
    </header>
  );
};

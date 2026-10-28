import React, { useEffect, useState } from 'react';
import {
  AvailabilitySlot,
  BlockedDate,
  DashboardSummary,
  Goal,
  PlanDiff,
  PlanGenerationResult,
  Session,
  Topic,
  User,
  UserPreferences,
} from '@ai-study-planner/shared';
import { api } from './api/client';
import { AddGoalModal } from './components/AddGoalModal';
import { AIBreakdownModal } from './components/AIBreakdownModal';
import { AccountProfileModal } from './components/AccountProfileModal';
import { AppGuideModal } from './components/AppGuideModal';
import { ArcadeHero } from './components/ArcadeHero';
import { AssistantDrawer } from './components/AssistantDrawer';
import { FocusTimerModal } from './components/FocusTimerModal';
import { ActiveTab, Navigation } from './components/Navigation';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ReplanDiffModal } from './components/ReplanDiffModal';
import { AvailabilityView } from './pages/AvailabilityView';
import { DashboardView } from './pages/DashboardView';
import { GoalsView } from './pages/GoalsView';
import { TodayView } from './pages/TodayView';
import { WeekCalendarView } from './pages/WeekCalendarView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [takingLonger, setTakingLonger] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light arcade cream theme matching reference!
  const [hasReplanAlert, setHasReplanAlert] = useState(false);
  const [replanResult, setReplanResult] = useState<PlanGenerationResult | null>(null);
  const [isReplanModalOpen, setIsReplanModalOpen] = useState(false);
  const [replanLoading, setReplanLoading] = useState(false);

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'profile' | 'needs' | 'auth'>('profile');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [selectedGoalForBreakdown, setSelectedGoalForBreakdown] = useState<Goal | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [focusSession, setFocusSession] = useState<Session | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Load all app data
  const loadData = async () => {
    try {
      let currentUser: User | null = null;
      try {
        const meRes = await api.getMe();
        currentUser = meRes.user;
      } catch {
        const demoRes = await api.demoLogin();
        currentUser = demoRes.user;
      }
      setUser(currentUser);

      const [goalsRes, availRes, blockedRes, sessRes, sumRes] = await Promise.all([
        api.getGoals(),
        api.getAvailability(),
        api.getBlockedDates(),
        api.getSessions(),
        api.getDashboardSummary(),
      ]);

      setGoals(goalsRes.goals);
      setAvailability(availRes.availability);
      setBlockedDates(blockedRes.blockedDates);
      setSessions(sessRes.sessions);
      setSummary(sumRes.summary);

      const allTopics: Topic[] = [];
      for (const g of goalsRes.goals) {
        try {
          const tRes = await api.getTopics(g.id);
          allTopics.push(...tRes.topics);
        } catch (e) {
          console.warn('Error fetching topics for goal', g.id);
        }
      }
      setTopics(allTopics);

      const hasMissed = sessRes.sessions.some(
        (s) => s.status === 'skipped' || s.status === 'partial'
      );
      setHasReplanAlert(hasMissed);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setTimeout(() => {
      setTakingLonger(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const scrollToWorkspace = () => {
    const el = document.getElementById('study-workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectMode = (mode: 'schedule' | 'syllabus' | 'timer') => {
    if (mode === 'schedule') {
      setActiveTab('today');
      scrollToWorkspace();
    } else if (mode === 'syllabus') {
      setActiveTab('goals');
      scrollToWorkspace();
      const firstGoal = goals[0];
      if (firstGoal) {
        setSelectedGoalForBreakdown(firstGoal);
        setIsBreakdownModalOpen(true);
      }
    } else if (mode === 'timer') {
      const pending = sessions.find((s) => s.status === 'pending') || sessions[0];
      if (pending) {
        setFocusSession(pending);
      } else {
        setActiveTab('today');
        scrollToWorkspace();
      }
    }
  };

  // Handle Session completion from Focus Timer
  const handleCompleteSession = async (
    sessionId: string,
    actualMinutes: number,
    confidence: number,
    notes: string
  ) => {
    try {
      await api.updateSession(sessionId, {
        status: 'done',
        actualMinutes,
        confidence,
        notes,
      });
      await loadData();
    } catch (err: any) {
      alert(`Error saving session: ${err.message}`);
    }
  };

  // Handle Quick status change (done <-> pending, skipped, partial)
  const handleUpdateSessionStatus = async (
    sessionId: string,
    status: 'done' | 'pending' | 'partial' | 'skipped',
    actualMinutes?: number
  ) => {
    // Optimistic UI update for instantaneous responsiveness
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status, actualMinutes } : s))
    );

    try {
      const res = await api.updateSession(sessionId, { status, actualMinutes });
      if (res.replanRecommended) {
        setHasReplanAlert(true);
      } else if (status === 'done' || status === 'pending') {
        const stillSkipped = sessions.some(
          (s) => s.id !== sessionId && (s.status === 'skipped' || s.status === 'partial')
        );
        setHasReplanAlert(stillSkipped);
      }
      await loadData();
    } catch (err: any) {
      alert(`Error updating session: ${err.message}`);
      await loadData();
    }
  };

  // Trigger Adaptive Re-plan Preview
  const handleTriggerReplan = async (trigger: string = 'session_skipped') => {
    setReplanLoading(true);
    setIsReplanModalOpen(true);
    try {
      const res = await api.replan(trigger);
      setReplanResult(res);
    } catch (err: any) {
      alert(`Re-plan error: ${err.message}`);
      setIsReplanModalOpen(false);
    } finally {
      setReplanLoading(false);
    }
  };

  // Apply Re-plan schedule to DB
  const handleApplyReplan = async (newSessions: Session[], diff?: PlanDiff) => {
    setReplanLoading(true);
    try {
      await api.applyPlan(newSessions, diff);
      setHasReplanAlert(false);
      setIsReplanModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(`Failed to apply re-plan: ${err.message}`);
    } finally {
      setReplanLoading(false);
    }
  };

  // Create Goal
  const handleCreateGoal = async (goalData: any) => {
    try {
      const res = await api.createGoal(goalData);
      const newGoal = res.goal;

      if (goalData.autoBreakdown) {
        await api.generateBreakdown({
          goalId: newGoal.id,
          title: newGoal.title,
          autoSave: true,
        });
      }

      await api.generatePlan();
      await loadData();
    } catch (err: any) {
      alert(`Failed to create goal: ${err.message}`);
    }
  };

  // Delete Goal
  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal and its schedule?')) return;
    try {
      await api.deleteGoal(goalId);
      await loadData();
    } catch (err: any) {
      alert(`Failed to delete goal: ${err.message}`);
    }
  };

  // Save Availability slots
  const handleSaveAvailability = async (slots: Omit<AvailabilitySlot, 'id' | 'userId'>[]) => {
    try {
      await api.setAvailability(slots);
      await api.generatePlan();
      await loadData();
    } catch (err: any) {
      alert(`Error saving availability: ${err.message}`);
    }
  };

  // Block Date
  const handleAddBlockedDate = async (blocked: Omit<BlockedDate, 'id' | 'userId'>) => {
    try {
      await api.addBlockedDate(blocked);
      await handleTriggerReplan('availability_changed');
    } catch (err: any) {
      alert(`Error adding blocked date: ${err.message}`);
    }
  };

  // Delete Blocked Date
  const handleDeleteBlockedDate = async (id: string) => {
    try {
      await api.deleteBlockedDate(id);
      await loadData();
    } catch (err: any) {
      alert(`Error deleting blocked date: ${err.message}`);
    }
  };

  // Save Preferences
  const handleSavePreferences = async (prefs: Partial<UserPreferences>) => {
    try {
      await api.updatePreferences(prefs);
      await api.generatePlan();
      await loadData();
    } catch (err: any) {
      alert(`Error updating preferences: ${err.message}`);
    }
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    if (!confirm('Reset schedule to clean demo college semester data?')) return;
    try {
      await api.resetDemo();
      await loadData();
      alert('Pristine demo dataset loaded!');
    } catch (err: any) {
      alert(`Reset error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#080b12] text-slate-100' : 'bg-[#f5f0e8] text-[#181a1f]'} flex flex-col items-center justify-center space-y-4 px-4 text-center transition-colors duration-200`}>
        <div className="font-serif font-bold text-4xl text-[#181a1f] dark:text-white tracking-tight animate-pulse font-space">
          PLAN<span className="italic text-[#c0392b]">MIND</span>
        </div>
        <div className="w-10 h-10 border-4 border-[#181a1f]/20 dark:border-slate-800 border-t-[#c0392b] rounded-full animate-spin"></div>
        <p className="font-mono font-bold text-xs tracking-widest text-[#716b5f] dark:text-slate-400 uppercase">
          CALIBRATING ADAPTIVE TIMETABLE...
        </p>

        {takingLonger && (
          <div className="max-w-md p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 animate-fade-in space-y-1.5 shadow-sm">
            <div className="font-bold flex items-center justify-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping mr-1" />
              <span>Cloud Engine Waking Up...</span>
            </div>
            <p className="text-[11px] text-[#554e42] dark:text-slate-300 leading-relaxed">
              The backend engine is spinning up from idle mode (cold start takes ~30s on free tier). Your personalized study plan will appear automatically in moments!
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#080b12] text-slate-100' : 'bg-[#f5f0e8] text-[#181a1f]'} transition-colors duration-200`}>
      {/* 1. ARCADE HERO & TOP NAVIGATION (Matching User Reference Image) */}
      <ArcadeHero
        onSelectMode={handleSelectMode}
        onOpenSchedule={scrollToWorkspace}
        onOpenCopilot={() => setIsAssistantOpen(true)}
        onOpenReplan={() => handleTriggerReplan()}
        onOpenAddGoal={() => setIsAddGoalModalOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onResetDemo={handleResetDemo}
        streakDays={summary?.streakDays || 1}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenProfile={() => {
          setProfileInitialTab('profile');
          setIsProfileModalOpen(true);
        }}
      />

      {/* 2. INTERACTIVE STUDY WORKSPACE */}
      <div id="study-workspace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Workspace Mode Switcher Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-[#e2d8c7] dark:border-slate-800">
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-semibold scrollbar-none">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'today'
                  ? 'bg-[#1e5bb5] text-white shadow-sm font-bold'
                  : 'bg-[#ebe3d5]/70 dark:bg-slate-800 text-[#4a453b] dark:text-slate-300 hover:bg-[#ded5c5]'
              }`}
            >
              <span>Today's Sessions</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-mono">
                {sessions.filter((s) => s.status === 'pending').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('week')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'week'
                  ? 'bg-[#b85412] text-white shadow-sm font-bold'
                  : 'bg-[#ebe3d5]/70 dark:bg-slate-800 text-[#4a453b] dark:text-slate-300 hover:bg-[#ded5c5]'
              }`}
            >
              <span>7-Day Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'goals'
                  ? 'bg-[#c0392b] text-white shadow-sm font-bold'
                  : 'bg-[#ebe3d5]/70 dark:bg-slate-800 text-[#4a453b] dark:text-slate-300 hover:bg-[#ded5c5]'
              }`}
            >
              <span>Goals & Syllabus</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-mono">
                {goals.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('availability')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'availability'
                  ? 'bg-slate-800 text-white shadow-sm font-bold'
                  : 'bg-[#ebe3d5]/70 dark:bg-slate-800 text-[#4a453b] dark:text-slate-300 hover:bg-[#ded5c5]'
              }`}
            >
              <span>Availability & Slots</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-700 text-white shadow-sm font-bold'
                  : 'bg-[#ebe3d5]/70 dark:bg-slate-800 text-[#4a453b] dark:text-slate-300 hover:bg-[#ded5c5]'
              }`}
            >
              <span>Radar & Stats</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold">
            {/* Quick Plan Needs Button */}
            <button
              onClick={() => {
                setProfileInitialTab('needs');
                setIsProfileModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl border border-[#ded5c6] dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-[#4a453b] dark:text-slate-300 hover:bg-[#ebe3d5] dark:hover:bg-slate-700 flex items-center space-x-1 transition-all shadow-sm"
              title="Tailor study track and plan needs"
            >
              <span>⚙️ Plan Needs</span>
            </button>

            {/* Quick Re-Plan Button */}
            <button
              onClick={() => handleTriggerReplan('manual')}
              className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-all shadow-sm ${
                hasReplanAlert
                  ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-800 dark:text-amber-200 animate-pulse font-bold'
                  : 'bg-[#ebe3d5]/70 dark:bg-slate-800 border-[#ded5c6] dark:border-slate-700 text-[#4a453b] dark:text-slate-300 hover:bg-[#ded5c6]'
              }`}
              title="Recalculate adaptive study timetable"
            >
              <span>⚡ Re-Plan</span>
              {hasReplanAlert && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setIsAddGoalModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#c0392b] hover:bg-[#a82d20] text-white shadow-sm flex items-center space-x-1 transition-all"
            >
              <span>+ Add Goal</span>
            </button>

            <button
              onClick={() => setIsAssistantOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-sm flex items-center space-x-1 transition-all"
            >
              <span>AI Copilot</span>
            </button>
          </div>
        </div>

        {/* Active Tab View */}
        {activeTab === 'today' && (
          <TodayView
            sessions={sessions}
            goals={goals}
            onStartSession={(session) => setFocusSession(session)}
            onUpdateStatus={handleUpdateSessionStatus}
            onTriggerReplan={() => handleTriggerReplan()}
            hasReplanAlert={hasReplanAlert}
            streakDays={summary?.streakDays || 1}
          />
        )}

        {activeTab === 'week' && (
          <WeekCalendarView
            sessions={sessions}
            goals={goals}
            onSelectSession={(session) => setFocusSession(session)}
            onUpdateStatus={handleUpdateSessionStatus}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            goals={goals}
            topics={topics}
            onAddGoal={() => setIsAddGoalModalOpen(true)}
            onDeleteGoal={handleDeleteGoal}
            onOpenBreakdown={(goal) => {
              setSelectedGoalForBreakdown(goal);
              setIsBreakdownModalOpen(true);
            }}
            onAddTopic={(goalId) => {}}
          />
        )}

        {activeTab === 'availability' && (
          <AvailabilityView
            availability={availability}
            blockedDates={blockedDates}
            preferences={user?.preferences || null}
            onSaveAvailability={handleSaveAvailability}
            onAddBlockedDate={handleAddBlockedDate}
            onDeleteBlockedDate={handleDeleteBlockedDate}
            onSavePreferences={handleSavePreferences}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView summary={summary} onRefresh={loadData} />
        )}
      </div>

      {/* 3. MODALS */}
      <FocusTimerModal
        session={focusSession}
        onClose={() => setFocusSession(null)}
        onComplete={handleCompleteSession}
      />

      <ReplanDiffModal
        isOpen={isReplanModalOpen}
        onClose={() => setIsReplanModalOpen(false)}
        replanResult={replanResult}
        isLoading={replanLoading}
        onApply={handleApplyReplan}
      />

      <AddGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        onSubmit={handleCreateGoal}
      />

      <AIBreakdownModal
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        goal={selectedGoalForBreakdown}
        onTopicsSaved={loadData}
      />

      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={loadData}
      />

      <AppGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          scrollToWorkspace();
        }}
        onOpenAddGoal={() => setIsAddGoalModalOpen(true)}
        onOpenReplan={() => handleTriggerReplan('manual')}
      />

      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        goals={goals}
        onProposalApplied={loadData}
      />

      <AccountProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={user}
        onUserChange={loadData}
        initialTab={profileInitialTab}
        streakDays={summary?.streakDays || 1}
        totalGoals={goals.length}
      />
    </div>
  );
};
export default App;

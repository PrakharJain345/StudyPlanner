import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  Code,
  Flame,
  GraduationCap,
  Layers,
  LogIn,
  LogOut,
  Mail,
  Moon,
  RefreshCw,
  Shield,
  Sliders,
  Sparkles,
  Stethoscope,
  Sun,
  Target,
  User as UserIcon,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { User, UserPreferences } from '@ai-study-planner/shared';
import { api } from '../api/client';

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChange: () => Promise<void>;
  initialTab?: 'profile' | 'needs' | 'auth';
  streakDays?: number;
  totalGoals?: number;
}

const TRACK_CARDS = [
  {
    id: 'engineering',
    name: 'CS & AI Engineering',
    icon: Code,
    color: '#6366f1',
    badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
    description: 'Data Structures, Operating Systems & Deep Learning',
    defaultPace: '5 hrs/day • Evening Focus',
  },
  {
    id: 'medical',
    name: 'Pre-Med & Healthcare',
    icon: Stethoscope,
    color: '#e11d48',
    badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    description: 'Human Anatomy, Medical Biochemistry & Clinical Pharmacology',
    defaultPace: '6 hrs/day • Morning Lark',
  },
  {
    id: 'business',
    name: 'Business & Quant Finance',
    icon: Briefcase,
    color: '#2563eb',
    badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    description: 'DCF Valuation, Microeconomics & Corporate Strategy',
    defaultPace: '4.5 hrs/day • Afternoon Sprint',
  },
  {
    id: 'competitive',
    name: 'Competitive Exams (GRE/GATE)',
    icon: Target,
    color: '#ea580c',
    badgeClass: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
    description: 'Quantitative Aptitude, Logic Puzzles & Verbal Reading',
    defaultPace: '5 hrs/day • Night Owl',
  },
  {
    id: 'custom',
    name: 'Custom Self-Directed',
    icon: GraduationCap,
    color: '#059669',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    description: 'Build your own customized syllabus and timetable',
    defaultPace: 'Flexible Cadence',
  },
];

const PREDEFINED_STUDENTS = [
  {
    persona: 'engineering',
    name: 'Prakhar',
    role: 'CS & AI Systems Major',
    email: 'student.demo@studyplanner.ai',
    track: 'engineering',
    badge: 'CS & AI',
    icon: Code,
    color: 'from-indigo-600 to-blue-600',
    details: '3 Goals (DSA, OS, ML) • 14 Topics • 5h/day Evening',
  },
  {
    persona: 'medical',
    name: 'Dr. Sophia',
    role: 'USMLE Medical Candidate',
    email: 'sophia.med@studyplanner.ai',
    track: 'medical',
    badge: 'Pre-Med',
    icon: Stethoscope,
    color: 'from-rose-600 to-pink-600',
    details: '3 Goals (Anatomy, BioChem, Pharm) • 13 Topics • 6h/day Morning',
  },
  {
    persona: 'business',
    name: 'Alex Vance',
    role: 'Finance & MBA Track',
    email: 'alex.quant@studyplanner.ai',
    track: 'business',
    badge: 'Finance & MBA',
    icon: Briefcase,
    color: 'from-blue-600 to-cyan-600',
    details: '3 Goals (Valuation, MicroEcon, Strategy) • 11 Topics • 4.5h/day',
  },
  {
    persona: 'competitive',
    name: 'Liam Chen',
    role: 'GRE / Placement Aspirant',
    email: 'liam.exam@studyplanner.ai',
    track: 'competitive',
    badge: 'Placement & GRE',
    icon: Target,
    color: 'from-orange-600 to-amber-600',
    details: '3 Goals (Quant, Logic, Verbal) • 10 Topics • 5h/day Night',
  },
];

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  initialTab = 'profile',
  streakDays = 1,
  totalGoals = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'needs' | 'auth'>(initialTab);
  const [authSubMode, setAuthSubMode] = useState<'personas' | 'login' | 'register'>('personas');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTrack, setRegTrack] = useState('engineering');
  const [regBootstrap, setRegBootstrap] = useState(true);

  // Edit Needs State
  const [selectedTrack, setSelectedTrack] = useState(currentUser?.studyTrack || 'engineering');
  const [sessionLen, setSessionLen] = useState(currentUser?.preferences?.sessionLength || 50);
  const [breakLen, setBreakLen] = useState(currentUser?.preferences?.breakLength || 10);
  const [maxHours, setMaxHours] = useState(currentUser?.preferences?.maxHoursPerDay || 5);
  const [preferredTime, setPreferredTime] = useState(currentUser?.preferences?.preferredTimeOfDay || 'evening');
  const [daysOff, setDaysOff] = useState<number[]>(currentUser?.preferences?.daysOff || [0]);
  const [bufferPercent, setBufferPercent] = useState(currentUser?.preferences?.bufferPercent || 15);

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const currentTrackMeta =
    TRACK_CARDS.find((t) => t.id === (currentUser?.studyTrack || 'engineering')) || TRACK_CARDS[0];

  // Quick Persona Login
  const handleSelectPersona = async (personaKey: string) => {
    setLoading(true);
    setMessage(null);
    try {
      await api.demoLogin(personaKey);
      await onUserChange();
      setMessage({ text: `Switched profile to ${personaKey.toUpperCase()} student!`, type: 'success' });
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to switch profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Standard Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.login(loginEmail, loginPassword);
      await onUserChange();
      setMessage({ text: 'Logged in successfully!', type: 'success' });
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setMessage({ text: err.message || 'Login failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        studyTrack: regTrack,
        bootstrapTemplate: regBootstrap,
      });
      await onUserChange();
      setMessage({ text: 'Account created with personalized study plan!', type: 'success' });
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setMessage({ text: err.message || 'Registration failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Save Needs Preferences
  const handleSaveNeeds = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await api.updatePreferences({
        sessionLength: sessionLen,
        breakLength: breakLen,
        maxHoursPerDay: maxHours,
        preferredTimeOfDay: preferredTime as any,
        daysOff,
        bufferPercent,
        studyTrack: selectedTrack,
      });
      await api.updateProfile({
        studyTrack: selectedTrack,
      });
      await api.generatePlan();
      await onUserChange();
      setMessage({ text: 'Study needs & adaptive timetable updated successfully!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to save preferences', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Apply Full Track Template
  const handleApplyCurriculumTemplate = async (trackId: string) => {
    if (
      !confirm(
        `Apply the full ${trackId.toUpperCase()} curriculum template? This will replace current sample goals with tailored courses and syllabus for this track.`
      )
    ) {
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await api.applyTrackTemplate(trackId);
      await onUserChange();
      setSelectedTrack(trackId);
      setMessage({ text: `Curriculum and timetable loaded for ${trackId.toUpperCase()} track!`, type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to load curriculum', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    if (!confirm('Are you sure you want to log out of this study account?')) return;
    api.logout();
    await onUserChange();
    setActiveTab('auth');
    setAuthSubMode('personas');
    setMessage({ text: 'Logged out. Select a profile or sign in below.', type: 'success' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#faf6ef] dark:bg-[#0f131c] border border-[#ded5c6] dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 transition-colors duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5dcce] dark:border-slate-800 bg-[#f2ebd9]/80 dark:bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#c0392b] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#181a1f] dark:text-white font-space flex items-center gap-2">
                <span>Account Profile & Study Plan Needs</span>
              </h2>
              <p className="text-[11px] text-[#716b5f] dark:text-slate-400">
                Tailor your academic track, pacing, and multi-user login
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#716b5f] hover:text-[#181a1f] dark:text-slate-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Alert Message */}
        {message && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-xs font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="flex items-center border-b border-[#e5dcce] dark:border-slate-800 px-6 pt-3 bg-[#faf6ef] dark:bg-[#0f131c]">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-[#c0392b] text-[#c0392b] dark:text-rose-400'
                : 'border-transparent text-[#716b5f] dark:text-slate-400 hover:text-[#181a1f] dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Active Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('needs')}
            className={`pb-3 px-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'needs'
                ? 'border-[#c0392b] text-[#c0392b] dark:text-rose-400'
                : 'border-transparent text-[#716b5f] dark:text-slate-400 hover:text-[#181a1f] dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Plan Needs</span>
          </button>

          <button
            onClick={() => setActiveTab('auth')}
            className={`pb-3 px-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'auth'
                ? 'border-[#c0392b] text-[#c0392b] dark:text-rose-400'
                : 'border-transparent text-[#716b5f] dark:text-slate-400 hover:text-[#181a1f] dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Switch User / Log In</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* ================= TAB 1: ACTIVE PROFILE ================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Card Banner */}
              <div className="p-5 rounded-2xl bg-[#f0e8d9]/70 dark:bg-slate-900/60 border border-[#ded5c6] dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#c0392b] via-indigo-600 to-[#1e5bb5] text-white flex items-center justify-center font-bold text-2xl shadow-md uppercase">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-[#181a1f] dark:text-white">
                        {currentUser?.name || 'Guest Student'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentTrackMeta.badgeClass}`}>
                        {currentTrackMeta.name}
                      </span>
                    </div>
                    <p className="text-xs text-[#716b5f] dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span>{currentUser?.email || 'No email registered'}</span>
                    </p>
                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-[#554e42] dark:text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-[#181a1f] dark:text-white">{streakDays} Day Streak</span>
                      </span>
                      <span>•</span>
                      <span>{totalGoals} Active Goals</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => setActiveTab('needs')}
                    className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-[#c0392b] hover:bg-[#a82d20] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Adjust My Plan Needs
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-xl border border-[#ded5c6] dark:border-slate-800 text-[#716b5f] dark:text-slate-400 hover:text-[#c0392b] text-xs font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5 flex items-center space-x-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>

              {/* Study Plan Specs Grid */}
              <div>
                <h4 className="text-xs font-bold text-[#716b5f] dark:text-slate-400 uppercase tracking-wider mb-3">
                  Current Study Plan Parameters & Needs
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/40 border border-[#ded5c6] dark:border-slate-800">
                    <div className="text-[10px] text-[#716b5f] dark:text-slate-400 uppercase font-bold">
                      Daily Max Study
                    </div>
                    <div className="text-base font-bold text-[#181a1f] dark:text-white mt-1">
                      {currentUser?.preferences?.maxHoursPerDay || 5} Hours / Day
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Adaptive ceiling</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/40 border border-[#ded5c6] dark:border-slate-800">
                    <div className="text-[10px] text-[#716b5f] dark:text-slate-400 uppercase font-bold">
                      Session Cadence
                    </div>
                    <div className="text-base font-bold text-[#181a1f] dark:text-white mt-1">
                      {currentUser?.preferences?.sessionLength || 50}m Focus
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      +{currentUser?.preferences?.breakLength || 10}m restorative break
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/40 border border-[#ded5c6] dark:border-slate-800">
                    <div className="text-[10px] text-[#716b5f] dark:text-slate-400 uppercase font-bold">
                      Preferred Study Window
                    </div>
                    <div className="text-base font-bold text-[#181a1f] dark:text-white mt-1 capitalize">
                      {currentUser?.preferences?.preferredTimeOfDay || 'evening'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Peak energy slot</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/40 border border-[#ded5c6] dark:border-slate-800">
                    <div className="text-[10px] text-[#716b5f] dark:text-slate-400 uppercase font-bold">
                      Weekly Rest Days
                    </div>
                    <div className="text-base font-bold text-[#181a1f] dark:text-white mt-1">
                      {(currentUser?.preferences?.daysOff || [0]).includes(0) ? 'Sundays Off' : 'Daily Grind'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Prevents burnout</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/40 border border-[#ded5c6] dark:border-slate-800">
                    <div className="text-[10px] text-[#716b5f] dark:text-slate-400 uppercase font-bold">
                      Catch-up Buffer
                    </div>
                    <div className="text-base font-bold text-[#181a1f] dark:text-white mt-1">
                      {currentUser?.preferences?.bufferPercent || 15}%
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">For missed topics & drift</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/40 border border-[#ded5c6] dark:border-slate-800">
                    <div className="text-[10px] text-[#716b5f] dark:text-slate-400 uppercase font-bold">
                      Curriculum Track
                    </div>
                    <div className="text-base font-bold text-[#181a1f] dark:text-white mt-1 truncate">
                      {currentTrackMeta.name}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{currentTrackMeta.defaultPace}</div>
                  </div>
                </div>
              </div>

              {/* Quick Persona Switcher Strip */}
              <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                      Want to experience how different users have different plans?
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('auth');
                      setAuthSubMode('personas');
                    }}
                    className="text-xs font-bold text-[#c0392b] hover:underline"
                  >
                    Switch User Profile &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: CUSTOMIZE PLAN NEEDS ================= */}
          {activeTab === 'needs' && (
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200">
                <p className="font-semibold">
                  Personalized Study Engine: Configure your curriculum track and time constraints.
                </p>
                <p className="text-[11px] mt-0.5 opacity-90">
                  Each user account maintains isolated goals, availability windows, and adaptive calendars tailored to their unique academic needs.
                </p>
              </div>

              {/* 1. Track Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#716b5f] dark:text-slate-400 mb-2">
                  1. Academic Track & Field of Study
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TRACK_CARDS.map((track) => {
                    const Icon = track.icon;
                    const isSelected = selectedTrack === track.id;
                    return (
                      <div
                        key={track.id}
                        onClick={() => setSelectedTrack(track.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#c0392b] bg-[#c0392b]/5 shadow-sm ring-1 ring-[#c0392b]'
                            : 'border-[#ded5c6] dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: track.color }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-[#181a1f] dark:text-white">
                              {track.name}
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#c0392b]" />}
                        </div>
                        <p className="text-[11px] text-[#716b5f] dark:text-slate-400 mt-2">
                          {track.description}
                        </p>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">
                          {track.defaultPace}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Pacing Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Daily Max Hours */}
                <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-[#ded5c6] dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#181a1f] dark:text-white">Max Hours / Day</span>
                    <span className="text-[#c0392b] font-mono">{maxHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="0.5"
                    value={maxHours}
                    onChange={(e) => setMaxHours(parseFloat(e.target.value))}
                    className="w-full accent-[#c0392b]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>2h (Casual)</span>
                    <span>5h (Standard)</span>
                    <span>8h (Intensive)</span>
                  </div>
                </div>

                {/* Focus Session Length */}
                <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-[#ded5c6] dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#181a1f] dark:text-white">Session Length</span>
                    <span className="text-[#c0392b] font-mono">{sessionLen} Minutes</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="120"
                    step="5"
                    value={sessionLen}
                    onChange={(e) => setSessionLen(parseInt(e.target.value))}
                    className="w-full accent-[#c0392b]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>25m (Pomodoro)</span>
                    <span>50m (Standard)</span>
                    <span>90m (Deep Block)</span>
                  </div>
                </div>

                {/* Preferred Time Window */}
                <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-[#ded5c6] dark:border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-[#181a1f] dark:text-white block">
                    Preferred Study Window
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[#ded5c6] dark:border-slate-800 bg-[#faf6ef] dark:bg-slate-800 text-[#181a1f] dark:text-white"
                  >
                    <option value="morning">Morning Lark (07:30 - 13:00)</option>
                    <option value="afternoon">Afternoon Focus (13:00 - 18:00)</option>
                    <option value="evening">Evening Intensive (17:00 - 22:00)</option>
                    <option value="night">Night Owl (20:00 - 02:00)</option>
                  </select>
                </div>

                {/* Rest Days */}
                <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-[#ded5c6] dark:border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-[#181a1f] dark:text-white block">
                    Weekly Rest Cadence
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDaysOff([0])}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                        daysOff.length === 1 && daysOff[0] === 0
                          ? 'bg-[#c0392b] text-white border-[#c0392b]'
                          : 'border-[#ded5c6] dark:border-slate-800 text-[#716b5f]'
                      }`}
                    >
                      Sunday Off
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysOff([0, 6])}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                        daysOff.length === 2
                          ? 'bg-[#c0392b] text-white border-[#c0392b]'
                          : 'border-[#ded5c6] dark:border-slate-800 text-[#716b5f]'
                      }`}
                    >
                      Weekends Off
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysOff([])}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                        daysOff.length === 0
                          ? 'bg-[#c0392b] text-white border-[#c0392b]'
                          : 'border-[#ded5c6] dark:border-slate-800 text-[#716b5f]'
                      }`}
                    >
                      7-Day Grind
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#ded5c6] dark:border-slate-800">
                <button
                  onClick={() => handleApplyCurriculumTemplate(selectedTrack)}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-all flex items-center justify-center space-x-1.5"
                  title="Wipe and populate sample courses for this track"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Load Curated {selectedTrack.toUpperCase()} Syllabus</span>
                </button>

                <button
                  onClick={handleSaveNeeds}
                  disabled={loading}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#c0392b] hover:bg-[#a82d20] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save & Re-Generate Timetable</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 3: SWITCH USER / AUTH ================= */}
          {activeTab === 'auth' && (
            <div className="space-y-6">
              {/* Sub-mode selector */}
              <div className="flex p-1 rounded-xl bg-[#ede5d6]/70 dark:bg-slate-900 border border-[#ded5c6] dark:border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setAuthSubMode('personas')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    authSubMode === 'personas'
                      ? 'bg-white dark:bg-slate-800 text-[#c0392b] dark:text-rose-400 shadow-sm'
                      : 'text-[#716b5f] dark:text-slate-400'
                  }`}
                >
                  ⚡ 1-Click Persona Demo
                </button>
                <button
                  onClick={() => setAuthSubMode('login')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    authSubMode === 'login'
                      ? 'bg-white dark:bg-slate-800 text-[#c0392b] dark:text-rose-400 shadow-sm'
                      : 'text-[#716b5f] dark:text-slate-400'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthSubMode('register')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    authSubMode === 'register'
                      ? 'bg-white dark:bg-slate-800 text-[#c0392b] dark:text-rose-400 shadow-sm'
                      : 'text-[#716b5f] dark:text-slate-400'
                  }`}
                >
                  New Account
                </button>
              </div>

              {/* Sub-mode 1: 1-Click Student Personas */}
              {authSubMode === 'personas' && (
                <div className="space-y-4">
                  <div className="text-xs text-[#716b5f] dark:text-slate-400">
                    Click any student persona to immediately log into their profile and inspect their unique curriculum, goals, and schedule:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PREDEFINED_STUDENTS.map((student) => {
                      const Icon = student.icon;
                      const isCurrent = currentUser?.email === student.email;
                      return (
                        <div
                          key={student.persona}
                          onClick={() => handleSelectPersona(student.persona)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                            isCurrent
                              ? 'border-[#c0392b] bg-[#c0392b]/5 ring-1 ring-[#c0392b]'
                              : 'border-[#ded5c6] dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 hover:border-slate-400'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${student.color} text-white flex items-center justify-center font-bold shadow-sm shrink-0`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-[#181a1f] dark:text-white truncate">
                                  {student.name}
                                </h4>
                                {isCurrent && (
                                  <span className="text-[10px] font-bold text-[#c0392b] uppercase px-1.5 py-0.2 rounded bg-[#c0392b]/10">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#716b5f] dark:text-slate-400 truncate">
                                {student.role}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-[#ded5c6]/60 dark:border-slate-800/60 text-[11px] text-[#554e42] dark:text-slate-300">
                            {student.details}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-mode 2: Sign In Form */}
              {authSubMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#181a1f] dark:text-white mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full text-xs p-2.5 rounded-xl border border-[#ded5c6] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#181a1f] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#181a1f] dark:text-white mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs p-2.5 rounded-xl border border-[#ded5c6] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#181a1f] dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-[#c0392b] hover:bg-[#a82d20] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    <span>Sign In to Account</span>
                  </button>
                </form>
              )}

              {/* Sub-mode 3: Register Form */}
              {authSubMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#181a1f] dark:text-white mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full text-xs p-2.5 rounded-xl border border-[#ded5c6] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#181a1f] dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#181a1f] dark:text-white mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="john@university.edu"
                        className="w-full text-xs p-2.5 rounded-xl border border-[#ded5c6] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#181a1f] dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#181a1f] dark:text-white mb-1">
                      Create Password
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full text-xs p-2.5 rounded-xl border border-[#ded5c6] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#181a1f] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#181a1f] dark:text-white mb-1">
                      Choose Your Primary Field / Study Track
                    </label>
                    <select
                      value={regTrack}
                      onChange={(e) => setRegTrack(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#ded5c6] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#181a1f] dark:text-white"
                    >
                      <option value="engineering">Computer Science & AI Systems</option>
                      <option value="medical">Pre-Med & Healthcare (USMLE)</option>
                      <option value="business">Business, Finance & MBA Track</option>
                      <option value="competitive">Competitive Exams (GRE/GATE/CAT)</option>
                      <option value="custom">Custom Track (Blank Canvas)</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="regBootstrap"
                      checked={regBootstrap}
                      onChange={(e) => setRegBootstrap(e.target.checked)}
                      className="rounded accent-[#c0392b]"
                    />
                    <label htmlFor="regBootstrap" className="text-xs text-[#554e42] dark:text-slate-300">
                      Bootstrap with curated high-yield syllabus and timetable for this track
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-[#c0392b] hover:bg-[#a82d20] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    <span>Create Profile & Generate Timetable</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AccountProfileModal;

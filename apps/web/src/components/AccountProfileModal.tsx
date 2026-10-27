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
  Copy,
  Cpu,
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
  Sunrise,
  Sunset,
  Target,
  User as UserIcon,
  UserPlus,
  Users,
  X,
  Zap,
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
    id: 'business',
    name: 'Business & Quant Finance',
    tagline: 'Wharton & Wall Street Track',
    icon: Briefcase,
    color: '#2563eb',
    badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    description: '3-Statement DCF Valuation, Microeconomics & Corporate M&A Strategy',
    defaultPace: '4.5 hrs/day • Afternoon Focus',
    featuredScholar: 'Elon Musk',
  },
  {
    id: 'engineering',
    name: 'CS & AI Systems',
    tagline: 'Stanford AI & Kernel Engineering',
    icon: Code,
    color: '#6366f1',
    badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
    description: 'LeetCode DSA, Operating Systems Concurrency & Deep Learning',
    defaultPace: '5.0 hrs/day • Evening Focus',
    featuredScholar: 'Andrej Karpathy',
  },
  {
    id: 'medical',
    name: 'Pre-Med & Healthcare (USMLE)',
    tagline: 'Johns Hopkins Clinical Track',
    icon: Stethoscope,
    color: '#e11d48',
    badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    description: 'High-Yield Human Anatomy, Medical Biochemistry & Clinical Pharmacology',
    defaultPace: '6.0 hrs/day • Morning Rounds',
    featuredScholar: 'Dr. Gregory House',
  },
  {
    id: 'competitive',
    name: 'Competitive Exams & Quant Aptitude',
    tagline: 'Caltech & Olympiad Track',
    icon: Target,
    color: '#ea580c',
    badgeClass: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
    description: 'Speed Quantitative Aptitude, Logic Puzzles & Verbal Reading (GRE/GATE/CAT)',
    defaultPace: '5.0 hrs/day • Night Owl',
    featuredScholar: 'Richard Feynman',
  },
  {
    id: 'custom',
    name: 'Custom Self-Directed',
    tagline: 'Independent Research & Syllabi',
    icon: GraduationCap,
    color: '#059669',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    description: 'Build and tailor your custom curriculum, deadlines and study blocks',
    defaultPace: 'Custom Pacing & Schedule',
    featuredScholar: 'Self-Paced',
  },
];

const PREDEFINED_STUDENTS = [
  {
    persona: 'business',
    name: 'Elon Musk',
    role: 'Wharton Economics & Corporate Valuation',
    tag: 'Wharton / Penn • First Principles',
    email: 'elon.musk@x.finance',
    track: 'business',
    badge: 'MBA & Quant',
    icon: Briefcase,
    color: 'from-blue-600 via-indigo-600 to-cyan-500',
    initials: 'EM',
    quote: '"Boil financial systems down to first principles truth, then model cash flows & risk."',
    details: '3 Courses • DCF Valuation, Microeconomics, M&A Strategy • 4.5h/day',
  },
  {
    persona: 'engineering',
    name: 'Andrej Karpathy',
    role: 'AI Systems & Deep Learning Architect',
    tag: 'Stanford / OpenAI • Neural Architect',
    email: 'karpathy.ai@studyplanner.ai',
    track: 'engineering',
    badge: 'CS & AI Systems',
    icon: Code,
    color: 'from-indigo-600 via-purple-600 to-blue-600',
    initials: 'AK',
    quote: '"Build neural networks from scratch, profile CUDA kernels & master core algorithms."',
    details: '3 Courses • DSA, Operating Systems, Machine Learning Project • 5.0h/day',
  },
  {
    persona: 'medical',
    name: 'Dr. Gregory House',
    role: 'Diagnostic Medicine & Clinical USMLE',
    tag: 'Johns Hopkins • Clinical Fellow',
    email: 'house.md@studyplanner.ai',
    track: 'medical',
    badge: 'Clinical USMLE',
    icon: Stethoscope,
    color: 'from-rose-600 via-red-600 to-amber-600',
    initials: 'GH',
    quote: '"Differential diagnosis requires relentless human anatomy & clinical pharmacology."',
    details: '3 Courses • Anatomy & Phys, Biochemistry, Pharmacology • 6.0h/day',
  },
  {
    persona: 'competitive',
    name: 'Richard Feynman',
    role: 'Advanced Quant & Analytical Olympiad',
    tag: 'Caltech • Nobel Problem Solver',
    email: 'feynman.quant@studyplanner.ai',
    track: 'competitive',
    badge: 'Quant & Aptitude',
    icon: Target,
    color: 'from-amber-500 via-orange-600 to-rose-600',
    initials: 'RF',
    quote: '"What I cannot create, I do not understand. Break questions down with pure intuition."',
    details: '3 Courses • Quant Aptitude, Logic Puzzles, Verbal • 5.0h/day',
  },
  {
    persona: 'prakhar',
    name: 'Prakhar',
    role: 'Lead Architect & Core Student Profile',
    tag: 'PlanMind AI Creator',
    email: 'student.demo@studyplanner.ai',
    track: 'engineering',
    badge: 'Original Profile',
    icon: Cpu,
    color: 'from-slate-700 via-zinc-800 to-neutral-900',
    initials: 'PJ',
    quote: '"Calibrating deterministic scheduling engines to empower student flow states."',
    details: '3 Courses • Placement Semester Prep • 5.0h/day Evening Focus',
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
  const [regTrack, setRegTrack] = useState('business');
  const [regBootstrap, setRegBootstrap] = useState(true);

  // Edit Needs State
  const [selectedTrack, setSelectedTrack] = useState(currentUser?.studyTrack || 'business');
  const [sessionLen, setSessionLen] = useState(currentUser?.preferences?.sessionLength || 50);
  const [breakLen, setBreakLen] = useState(currentUser?.preferences?.breakLength || 10);
  const [maxHours, setMaxHours] = useState(currentUser?.preferences?.maxHoursPerDay || 5);
  const [preferredTime, setPreferredTime] = useState(currentUser?.preferences?.preferredTimeOfDay || 'afternoon');
  const [daysOff, setDaysOff] = useState<number[]>(currentUser?.preferences?.daysOff || [0]);
  const [bufferPercent, setBufferPercent] = useState(currentUser?.preferences?.bufferPercent || 15);

  // UI state
  const [loading, setLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const currentTrackMeta =
    TRACK_CARDS.find((t) => t.id === (currentUser?.studyTrack || 'engineering')) || TRACK_CARDS[0];

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Quick Persona Login
  const handleSelectPersona = async (personaKey: string) => {
    setLoading(true);
    setMessage(null);
    try {
      await api.demoLogin(personaKey);
      await onUserChange();
      const student = PREDEFINED_STUDENTS.find((s) => s.persona === personaKey);
      setMessage({
        text: `Switched session to ${student?.name || personaKey} (${student?.badge || 'Track'})!`,
        type: 'success',
      });
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
      setMessage({ text: `Account created for ${regName} with ${regTrack.toUpperCase()} plan!`, type: 'success' });
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
      setMessage({ text: 'Study plan needs & adaptive timetable calibrated successfully!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to save preferences', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Apply Full Track Template
  const handleApplyCurriculumTemplate = async (trackId: string) => {
    const trackObj = TRACK_CARDS.find((t) => t.id === trackId);
    if (
      !confirm(
        `Load the curated curriculum for "${trackObj?.name || trackId}"? This will populate the high-yield courses and topics tailored for this academic track.`
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
      setMessage({
        text: `Curriculum and timetable loaded for ${trackObj?.name || trackId.toUpperCase()}!`,
        type: 'success',
      });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to load curriculum', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    if (!confirm('Are you sure you want to log out of this study session?')) return;
    api.logout();
    await onUserChange();
    setActiveTab('auth');
    setAuthSubMode('personas');
    setMessage({ text: 'Logged out. Select a profile or sign in below.', type: 'success' });
  };

  // Get active student match if any
  const currentPersona = PREDEFINED_STUDENTS.find(
    (s) => s.email.toLowerCase() === (currentUser?.email || '').toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Background ambient radial glow matching active profile */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div
          className="w-[500px] h-[500px] rounded-full blur-[140px] opacity-25 dark:opacity-20 transition-all duration-700"
          style={{ backgroundColor: currentTrackMeta.color }}
        />
      </div>

      {/* Main Modal Dialog Box */}
      <div className="relative w-full max-w-2xl bg-[#faf6ef] dark:bg-[#0c1017] border-2 border-[#ded4c2] dark:border-slate-800 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] overflow-hidden my-6 transition-all duration-200">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5dcce] dark:border-slate-800/80 bg-[#f2ebd9]/90 dark:bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md font-bold text-sm"
              style={{ backgroundColor: currentTrackMeta.color }}
            >
              {currentPersona ? (
                <span className="font-mono text-xs font-black">{currentPersona.initials}</span>
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#716b5f] dark:text-slate-400 uppercase">
                  PLANMIND ID // PROFILE & STUDY NEEDS
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  ACTIVE
                </span>
              </div>
              <h2 className="text-base font-bold text-[#181a1f] dark:text-white font-space mt-0.5">
                {currentUser?.name || 'Student Account'} •{' '}
                <span className="text-[#c0392b] dark:text-rose-400">{currentTrackMeta.name}</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#716b5f] hover:text-[#181a1f] dark:text-slate-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
            title="Close Modal"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Banner Alert Message */}
        {message && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b transition-all ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              )}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-xs font-bold hover:underline opacity-80">
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Navigation Segmented Ribbon */}
        <div className="px-6 pt-3.5 pb-2 border-b border-[#e5dcce] dark:border-slate-800/80 bg-[#faf6ef] dark:bg-[#0c1017]">
          <div className="flex items-center p-1 rounded-2xl bg-[#ede5d6]/70 dark:bg-slate-900/90 border border-[#ded5c6] dark:border-slate-800 shadow-inner text-xs font-bold">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all duration-150 flex items-center justify-center space-x-1.5 ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-slate-800 text-[#181a1f] dark:text-white shadow-sm font-extrabold'
                  : 'text-[#716b5f] dark:text-slate-400 hover:text-[#181a1f] dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#c0392b]" />
              <span>Active Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('needs')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all duration-150 flex items-center justify-center space-x-1.5 ${
                activeTab === 'needs'
                  ? 'bg-white dark:bg-slate-800 text-[#181a1f] dark:text-white shadow-sm font-extrabold'
                  : 'text-[#716b5f] dark:text-slate-400 hover:text-[#181a1f] dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Customize Plan Needs</span>
            </button>

            <button
              onClick={() => setActiveTab('auth')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all duration-150 flex items-center justify-center space-x-1.5 ${
                activeTab === 'auth'
                  ? 'bg-white dark:bg-slate-800 text-[#181a1f] dark:text-white shadow-sm font-extrabold'
                  : 'text-[#716b5f] dark:text-slate-400 hover:text-[#181a1f] dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>Switch User (Elon, Andrej...)</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-6">
          {/* ================= TAB 1: ACTIVE PROFILE ================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Executive Scholar ID Badge */}
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-white/90 to-[#f2ebd9]/70 dark:from-slate-900/90 dark:to-[#111724]/90 border border-[#ded5c6] dark:border-slate-800 shadow-sm overflow-hidden">
                <div
                  className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-25 pointer-events-none"
                  style={{ backgroundColor: currentTrackMeta.color }}
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div
                        className="w-16 h-16 rounded-2xl bg-gradient-to-tr text-white flex items-center justify-center font-bold text-2xl shadow-md uppercase"
                        style={{ backgroundColor: currentTrackMeta.color }}
                      >
                        {currentPersona ? currentPersona.initials : currentUser?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center" title="Online & Synced">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="text-lg font-bold text-[#181a1f] dark:text-white font-space">
                          {currentUser?.name || 'Scholar'}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${currentTrackMeta.badgeClass}`}>
                          {currentTrackMeta.name}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 mt-1">
                        <button
                          onClick={() => handleCopyEmail(currentUser?.email || '')}
                          className="text-xs text-[#716b5f] dark:text-slate-400 flex items-center space-x-1.5 hover:text-[#181a1f] dark:hover:text-white transition-colors group"
                          title="Click to copy email"
                        >
                          <Mail className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                          <span className="font-mono text-[11px]">{currentUser?.email || 'student@studyplanner.ai'}</span>
                          {copiedEmail ? (
                            <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                          ) : (
                            <Copy className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                          )}
                        </button>
                      </div>

                      {currentPersona?.quote && (
                        <p className="text-[11px] italic text-[#5a5447] dark:text-slate-400 mt-2 line-clamp-2">
                          {currentPersona.quote}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => setActiveTab('needs')}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#c0392b] hover:bg-[#a82d20] text-white text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 flex items-center justify-center space-x-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Adjust Plan Needs</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3.5 py-1.5 rounded-xl border border-[#ded5c6] dark:border-slate-800 text-[#716b5f] dark:text-slate-400 hover:text-[#c0392b] text-xs font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5 flex items-center space-x-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4-Stat Metric HUD */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-[#ded5c6] dark:border-slate-800/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#716b5f] dark:text-slate-400 uppercase tracking-wider">
                      Study Streak
                    </span>
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                  </div>
                  <div className="text-xl font-black text-[#181a1f] dark:text-white mt-1">
                    {streakDays} <span className="text-xs font-normal text-slate-500">Days</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    Consistent habit
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-[#ded5c6] dark:border-slate-800/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#716b5f] dark:text-slate-400 uppercase tracking-wider">
                      Active Goals
                    </span>
                    <Target className="w-3.5 h-3.5 text-[#c0392b]" />
                  </div>
                  <div className="text-xl font-black text-[#181a1f] dark:text-white mt-1">
                    {totalGoals} <span className="text-xs font-normal text-slate-500">Enrolled</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Courses & Projects</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-[#ded5c6] dark:border-slate-800/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#716b5f] dark:text-slate-400 uppercase tracking-wider">
                      Daily Target
                    </span>
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="text-xl font-black text-[#181a1f] dark:text-white mt-1">
                    {currentUser?.preferences?.maxHoursPerDay || 5} <span className="text-xs font-normal text-slate-500">h / day</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Adaptive ceiling</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-[#ded5c6] dark:border-slate-800/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#716b5f] dark:text-slate-400 uppercase tracking-wider">
                      Catch-up Buffer
                    </span>
                    <Zap className="w-3.5 h-3.5 text-purple-500" />
                  </div>
                  <div className="text-xl font-black text-[#181a1f] dark:text-white mt-1">
                    {currentUser?.preferences?.bufferPercent || 15}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Missed session leeway</div>
                </div>
              </div>

              {/* Study Plan Specs Matrix */}
              <div>
                <h4 className="text-[11px] font-mono font-bold text-[#716b5f] dark:text-slate-400 uppercase tracking-wider mb-2.5">
                  CURRENT TIMETABLE CONSTRAINTS
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#faf6ef] dark:bg-slate-900/30 border border-[#ded5c6] dark:border-slate-800">
                    <span className="text-[10px] text-[#716b5f] dark:text-slate-400 uppercase font-bold">
                      Session Block
                    </span>
                    <div className="text-xs font-bold text-[#181a1f] dark:text-white mt-0.5">
                      {currentUser?.preferences?.sessionLength || 50}m Focus + {currentUser?.preferences?.breakLength || 10}m Break
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#faf6ef] dark:bg-slate-900/30 border border-[#ded5c6] dark:border-slate-800">
                    <span className="text-[10px] text-[#716b5f] dark:text-slate-400 uppercase font-bold">
                      Preferred Energy Window
                    </span>
                    <div className="text-xs font-bold text-[#181a1f] dark:text-white mt-0.5 capitalize flex items-center space-x-1">
                      <span>{currentUser?.preferences?.preferredTimeOfDay || 'evening'} focus</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#faf6ef] dark:bg-slate-900/30 border border-[#ded5c6] dark:border-slate-800">
                    <span className="text-[10px] text-[#716b5f] dark:text-slate-400 uppercase font-bold">
                      Weekly Rest Day
                    </span>
                    <div className="text-xs font-bold text-[#181a1f] dark:text-white mt-0.5">
                      {(currentUser?.preferences?.daysOff || [0]).includes(0) ? 'Sundays Off' : 'Daily Grind'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Famous Persona Spotlight Callout */}
              <div className="p-4 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-50/70 via-blue-50/60 to-purple-50/50 dark:from-indigo-950/30 dark:via-blue-950/30 dark:to-purple-950/20 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      Explore How Different Minds Plan Study Time
                    </div>
                    <div className="text-[11px] text-indigo-700 dark:text-indigo-400">
                      Test Elon Musk (MBA Finance), Andrej Karpathy (AI), or Dr. House (Pre-Med)
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('auth');
                    setAuthSubMode('personas');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all shrink-0 hover:scale-105 active:scale-95"
                >
                  Switch &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: CUSTOMIZE PLAN NEEDS ================= */}
          {activeTab === 'needs' && (
            <div className="space-y-6">
              {/* Concept Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200">
                <div className="flex items-center space-x-2 font-bold text-amber-800 dark:text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Adaptive Multi-Track Architecture: Different Users, Different Needs</span>
                </div>
                <p className="text-[11px] text-[#554e42] dark:text-slate-300 mt-1 leading-relaxed">
                  Every student possesses distinct exam requirements, available hours, and peak focus rhythms.
                  Select your track and calibrate your hours below to regenerate a personalized timetable.
                </p>
              </div>

              {/* 1. Track Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#716b5f] dark:text-slate-400 mb-2.5">
                  1. Select Academic Track & Field of Study
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TRACK_CARDS.map((track) => {
                    const Icon = track.icon;
                    const isSelected = selectedTrack === track.id;
                    return (
                      <div
                        key={track.id}
                        onClick={() => setSelectedTrack(track.id)}
                        className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#c0392b] bg-white dark:bg-slate-900/90 shadow-md ring-2 ring-[#c0392b]/20 scale-[1.01]'
                            : 'border-[#ded5c6] dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 hover:border-slate-400 hover:bg-white dark:hover:bg-slate-900/70'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
                              style={{ backgroundColor: track.color }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#181a1f] dark:text-white">
                                {track.name}
                              </div>
                              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                {track.tagline}
                              </div>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                              isSelected
                                ? 'bg-[#c0392b] border-[#c0392b] text-white'
                                : 'border-slate-300 dark:border-slate-700 bg-transparent'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <p className="text-[11px] text-[#5a5447] dark:text-slate-300 mt-2.5 leading-snug">
                          {track.description}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-[#ded5c6]/60 dark:border-slate-800/60 flex items-center justify-between text-[10px]">
                          <span className="font-mono text-slate-500">{track.defaultPace}</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            e.g. {track.featuredScholar}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Pacing Sliders & Cadence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Daily Max Hours */}
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-[#ded5c6] dark:border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#181a1f] dark:text-white flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>Daily Study Ceiling</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#c0392b]/10 text-[#c0392b] font-mono font-bold text-xs">
                      {maxHours} Hours / Day
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="0.5"
                    value={maxHours}
                    onChange={(e) => setMaxHours(parseFloat(e.target.value))}
                    className="w-full accent-[#c0392b] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>2h (Casual)</span>
                    <span>4.5h (Executive Elon)</span>
                    <span>8h (Intensive)</span>
                  </div>
                </div>

                {/* Focus Session Length */}
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-[#ded5c6] dark:border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#181a1f] dark:text-white flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Focus Session Duration</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs">
                      {sessionLen} Minutes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="120"
                    step="5"
                    value={sessionLen}
                    onChange={(e) => setSessionLen(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>25m (Pomodoro)</span>
                    <span>50m (Standard)</span>
                    <span>90m (Deep Work)</span>
                  </div>
                </div>
              </div>

              {/* 3. Preferred Time Window (Card Tiles) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#716b5f] dark:text-slate-400 mb-2">
                  2. Peak Focus Energy Window
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'morning', label: 'Morning Lark', time: '07:30 - 13:00', icon: Sunrise },
                    { id: 'afternoon', label: 'Afternoon Sprint', time: '13:00 - 18:00', icon: Sun },
                    { id: 'evening', label: 'Evening Hustle', time: '17:00 - 22:00', icon: Sunset },
                    { id: 'night', label: 'Night Owl', time: '20:00 - 02:00', icon: Moon },
                  ].map((slot) => {
                    const SlotIcon = slot.icon;
                    const isSelected = preferredTime === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setPreferredTime(slot.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#c0392b] bg-[#c0392b]/10 text-[#c0392b] dark:text-rose-400 font-bold shadow-xs'
                            : 'border-[#ded5c6] dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 text-[#554e42] dark:text-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <SlotIcon className="w-4 h-4 mb-1.5" />
                        <div className="text-xs font-bold leading-none">{slot.label}</div>
                        <div className="text-[10px] opacity-75 font-mono mt-1">{slot.time}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Rest Cadence */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#716b5f] dark:text-slate-400 mb-2">
                  3. Weekly Recovery & Buffer
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDaysOff([0])}
                    className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      daysOff.length === 1 && daysOff[0] === 0
                        ? 'bg-[#c0392b] text-white border-[#c0392b] shadow-xs'
                        : 'border-[#ded5c6] dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 text-[#554e42] dark:text-slate-300 hover:bg-black/5'
                    }`}
                  >
                    Sundays Off (Recommended)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDaysOff([0, 6])}
                    className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      daysOff.length === 2
                        ? 'bg-[#c0392b] text-white border-[#c0392b] shadow-xs'
                        : 'border-[#ded5c6] dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 text-[#554e42] dark:text-slate-300 hover:bg-black/5'
                    }`}
                  >
                    Weekends Off (Sat & Sun)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDaysOff([])}
                    className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      daysOff.length === 0
                        ? 'bg-[#c0392b] text-white border-[#c0392b] shadow-xs'
                        : 'border-[#ded5c6] dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 text-[#554e42] dark:text-slate-300 hover:bg-black/5'
                    }`}
                  >
                    Everyday Grind (No Days Off)
                  </button>
                </div>
              </div>

              {/* Action Buttons Dock */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#ded5c6] dark:border-slate-800">
                <button
                  onClick={() => handleApplyCurriculumTemplate(selectedTrack)}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all flex items-center justify-center space-x-1.5 shadow-xs hover:scale-105 active:scale-95"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Load Curated {selectedTrack.toUpperCase()} Syllabus</span>
                </button>

                <button
                  onClick={handleSaveNeeds}
                  disabled={loading}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#c0392b] hover:bg-[#a82d20] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5 hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Needs & Re-Generate Timetable</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 3: SWITCH USER / AUTH ================= */}
          {activeTab === 'auth' && (
            <div className="space-y-6">
              {/* Sub-mode selector */}
              <div className="flex p-1 rounded-2xl bg-[#ede5d6]/70 dark:bg-slate-900 border border-[#ded5c6] dark:border-slate-800 text-xs font-bold shadow-inner">
                <button
                  onClick={() => setAuthSubMode('personas')}
                  className={`flex-1 py-1.5 rounded-xl transition-all ${
                    authSubMode === 'personas'
                      ? 'bg-white dark:bg-slate-800 text-[#c0392b] dark:text-rose-400 shadow-sm font-extrabold'
                      : 'text-[#716b5f] dark:text-slate-400 hover:text-[#181a1f] dark:hover:text-white'
                  }`}
                >
                  ⚡ Famous Scholars (Elon, Andrej...)
                </button>
                <button
                  onClick={() => setAuthSubMode('login')}
                  className={`flex-1 py-1.5 rounded-xl transition-all ${
                    authSubMode === 'login'
                      ? 'bg-white dark:bg-slate-800 text-[#c0392b] dark:text-rose-400 shadow-sm font-extrabold'
                      : 'text-[#716b5f] dark:text-slate-400 hover:text-[#181a1f] dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthSubMode('register')}
                  className={`flex-1 py-1.5 rounded-xl transition-all ${
                    authSubMode === 'register'
                      ? 'bg-white dark:bg-slate-800 text-[#c0392b] dark:text-rose-400 shadow-sm font-extrabold'
                      : 'text-[#716b5f] dark:text-slate-400 hover:text-[#181a1f] dark:hover:text-white'
                  }`}
                >
                  Register Profile
                </button>
              </div>

              {/* Sub-mode 1: 1-Click Famous Personas */}
              {authSubMode === 'personas' && (
                <div className="space-y-3.5">
                  <div className="text-xs text-[#716b5f] dark:text-slate-400 flex items-center justify-between">
                    <span>Click any scholar to immediately log into their pre-fed profile & curriculum:</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {PREDEFINED_STUDENTS.map((student) => {
                      const Icon = student.icon;
                      const isCurrent = currentUser?.email?.toLowerCase() === student.email.toLowerCase();
                      return (
                        <div
                          key={student.persona}
                          onClick={() => handleSelectPersona(student.persona)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.01] ${
                            isCurrent
                              ? 'border-[#c0392b] bg-white dark:bg-slate-900/90 shadow-md ring-2 ring-[#c0392b]/20'
                              : 'border-[#ded5c6] dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 hover:border-slate-400 hover:bg-white dark:hover:bg-slate-900/70'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center space-x-3.5">
                              <div
                                className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${student.color} text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0`}
                              >
                                {student.initials}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-bold text-[#181a1f] dark:text-white font-space">
                                    {student.name}
                                  </h4>
                                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#c0392b]/10 text-[#c0392b] dark:text-rose-400 border border-[#c0392b]/20">
                                    {student.badge}
                                  </span>
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] font-bold uppercase">
                                      CURRENT
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                  {student.role}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">{student.tag}</div>
                              </div>
                            </div>

                            <button
                              type="button"
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                isCurrent
                                  ? 'bg-[#c0392b] text-white shadow-xs'
                                  : 'border border-[#ded5c6] dark:border-slate-700 bg-[#faf6ef] dark:bg-slate-800 text-[#181a1f] dark:text-white hover:bg-[#c0392b] hover:text-white hover:border-[#c0392b]'
                              }`}
                            >
                              {isCurrent ? 'Active Now' : 'Switch &rarr;'}
                            </button>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-[#ded5c6]/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] gap-1">
                            <span className="italic text-[#554e42] dark:text-slate-300">
                              {student.quote}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500 shrink-0">
                              {student.details}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-mode 2: Sign In Form */}
              {authSubMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-xs font-bold text-[#181a1f] dark:text-white mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. elon.musk@x.finance"
                      className="w-full text-xs p-3 rounded-xl border border-[#ded5c6] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#181a1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
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
                      className="w-full text-xs p-3 rounded-xl border border-[#ded5c6] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#181a1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#c0392b] hover:bg-[#a82d20] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5 hover:scale-[1.01] active:scale-95"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    <span>Sign In to Student Account</span>
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
                        placeholder="e.g. Warren Buffett"
                        className="w-full text-xs p-2.5 rounded-xl border border-[#ded5c6] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#181a1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
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
                        placeholder="scholar@university.edu"
                        className="w-full text-xs p-2.5 rounded-xl border border-[#ded5c6] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#181a1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
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
                      className="w-full text-xs p-2.5 rounded-xl border border-[#ded5c6] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#181a1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#181a1f] dark:text-white mb-1">
                      Choose Field & Curriculum Track
                    </label>
                    <select
                      value={regTrack}
                      onChange={(e) => setRegTrack(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#ded5c6] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#181a1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                    >
                      <option value="business">Business & Quant Finance (Elon Musk Track)</option>
                      <option value="engineering">Computer Science & AI Systems (Andrej Karpathy Track)</option>
                      <option value="medical">Pre-Med & Healthcare USMLE (Dr. House Track)</option>
                      <option value="competitive">Competitive Exams & Aptitude (Richard Feynman Track)</option>
                      <option value="custom">Custom Independent Syllabus (Blank Canvas)</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="regBootstrap"
                      checked={regBootstrap}
                      onChange={(e) => setRegBootstrap(e.target.checked)}
                      className="rounded accent-[#c0392b] w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="regBootstrap" className="text-xs text-[#554e42] dark:text-slate-300 cursor-pointer">
                      Automatically bootstrap with curated courses and adaptive timetable for this track
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#c0392b] hover:bg-[#a82d20] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5 hover:scale-[1.01] active:scale-95"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    <span>Create Profile & Calibrate Timetable</span>
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

import React, { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  CheckCircle,
  Headphones,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { Session } from '@ai-study-planner/shared';

interface FocusTimerModalProps {
  session: Session | null;
  onClose: () => void;
  onComplete: (sessionId: string, actualMinutes: number, confidence: number, notes: string) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  session,
  onClose,
  onComplete,
}) => {
  if (!session) return null;

  // Default duration from session or 50 minutes
  const initialSeconds = 50 * 60;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [confidence, setConfidence] = useState(4);
  const [notes, setNotes] = useState('');
  const [actualMinutes, setActualMinutes] = useState(50);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setShowRatingModal(true);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    setIsRunning(false);
    const elapsedMinutes = Math.max(1, Math.round((initialSeconds - timeLeft) / 60));
    setActualMinutes(elapsedMinutes || 50);
    setShowRatingModal(true);
  };

  const handleSubmitRating = () => {
    onComplete(session.id, actualMinutes, confidence, notes);
    onClose();
  };

  const progressPercent = Math.min(100, Math.round(((initialSeconds - timeLeft) / initialSeconds) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel bg-slate-900/90 rounded-2xl border border-slate-700/80 p-6 md:p-8 shadow-2xl glow-primary">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
              Deep Work Focus Session
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!showRatingModal ? (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="mb-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                {session.type.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white max-w-sm mb-6">
              {session.title}
            </h2>

            {/* Circular Timer Visual */}
            <div className="relative w-56 h-56 flex items-center justify-center mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="98"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="98"
                  className="stroke-brand-500 transition-all duration-1000 ease-linear"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 98}
                  strokeDashoffset={2 * Math.PI * 98 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-mono font-bold tracking-tight text-white drop-shadow-md">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-slate-400 mt-1 font-medium">
                  {progressPercent}% completed
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => setTimeLeft(initialSeconds)}
                className="p-3 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                title="Reset timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-8 py-3.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center space-x-2 shadow-lg shadow-brand-600/40 glow-primary transition-all transform hover:scale-105"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                    <span>{timeLeft === initialSeconds ? 'Start Focus' : 'Resume'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleFinish}
                className="p-3 rounded-full bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition-all"
                title="Complete session early"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>

            {/* Ambient Sound & Quick Setters */}
            <div className="flex items-center space-x-6 text-xs text-slate-400">
              <button
                onClick={() => setAmbientSound(!ambientSound)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border transition-all ${
                  ambientSound
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {ambientSound ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{ambientSound ? 'Lo-Fi Ambient: Active' : 'Sound: Muted'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setIsRunning(false);
                    setTimeLeft(25 * 60);
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  25m
                </button>
                <button
                  onClick={() => {
                    setIsRunning(false);
                    setTimeLeft(50 * 60);
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  50m
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Post-Session Rating & Feedback Form */
          <div className="py-6 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Session Completed!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your effort is saved to your progress tracker. How well did you retain this material?
              </p>
            </div>

            {/* Actual Minutes Spent */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Actual Study Minutes Logged
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={actualMinutes}
                onChange={(e) => setActualMinutes(Number(e.target.value))}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Confidence Rating (1-5 Stars) */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Mastery / Confidence Rating
              </label>
              <div className="flex items-center justify-center space-x-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setConfidence(star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= confidence
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-[11px] text-slate-400 mt-1.5">
                {confidence <= 2
                  ? '⚠️ Low confidence: Adaptive engine will insert an earlier revision.'
                  : confidence >= 4
                  ? '🌟 Strong grasp: Spaced revision scheduled at optimal interval.'
                  : '👍 Moderate: Normal spaced repetition cycle.'}
              </p>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Quick Takeaways or Questions (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Mastered binary search invariants, review edge case when high == low"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmitRating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Log Study Session</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

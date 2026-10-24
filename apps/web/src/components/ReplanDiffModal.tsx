import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import { PlanDiff, PlanGenerationResult, Session } from '@ai-study-planner/shared';
import { format, parseISO } from 'date-fns';

interface ReplanDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  replanResult: PlanGenerationResult | null;
  isLoading: boolean;
  onApply: (sessions: Session[], diff?: PlanDiff) => void;
}

export const ReplanDiffModal: React.FC<ReplanDiffModalProps> = ({
  isOpen,
  onClose,
  replanResult,
  isLoading,
  onApply,
}) => {
  if (!isOpen || !replanResult) return null;

  const diff = replanResult.diff;
  const feasibility = replanResult.feasibility;
  const affected = diff?.affectedSessions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel bg-slate-900/95 rounded-2xl border border-slate-700 p-6 md:p-8 shadow-2xl glow-primary max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Adaptive Schedule Diff</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-medium">
                  {replanResult.sessions.length} Total Sessions
                </span>
              </h2>
              <p className="text-xs text-slate-400">Review changes before updating your master study plan.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Summary Banner */}
        <div className="my-5 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Re-Plan Summary
              </span>
              <p className="text-sm font-medium text-slate-200 mt-0.5">
                {diff?.summary || 'Intelligent rescheduling performed to preserve deadlines.'}
              </p>
            </div>
            {/* Feasibility Tag */}
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                feasibility === 'feasible'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : feasibility === 'tight'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {feasibility.toUpperCase()}
            </span>
          </div>

          {/* Warnings or Recommendations */}
          {replanResult.warnings && replanResult.warnings.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-700/60 text-xs text-amber-300/90 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{replanResult.warnings[0]}</span>
            </div>
          )}
        </div>

        {/* Affected Sessions List */}
        <div className="flex-1 overflow-y-auto pr-1 mb-6 space-y-2.5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Schedule Adjustments ({affected.length})
          </div>

          {affected.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 bg-slate-800/30 rounded-xl border border-slate-800">
              No sessions were shifted. Your current plan remains on optimal track!
            </div>
          ) : (
            affected.slice(0, 15).map((item, idx) => {
              const prevStartFormatted = item.previousStart
                ? format(parseISO(item.previousStart), 'MMM d, h:mm a')
                : 'Unscheduled';
              const newStartFormatted = format(parseISO(item.session.start), 'MMM d, h:mm a');

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-white">{item.session.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.action === 'moved'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : item.action === 'added'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {item.action}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{prevStartFormatted}</span>
                    <ArrowRight className="w-3 h-3 text-brand-400" />
                    <span className="text-brand-300 font-semibold">{newStartFormatted}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(replanResult.sessions, diff)}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 glow-primary flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Apply New Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};

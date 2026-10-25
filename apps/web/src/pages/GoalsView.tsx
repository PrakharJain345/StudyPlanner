import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Flag,
  Plus,
  Sparkles,
  Star,
  Target,
  Trash2,
} from 'lucide-react';
import { Goal, Topic } from '@ai-study-planner/shared';
import { differenceInDays, format, parseISO } from 'date-fns';

interface GoalsViewProps {
  goals: Goal[];
  topics: Topic[];
  onAddGoal: () => void;
  onDeleteGoal: (goalId: string) => void;
  onOpenBreakdown: (goal: Goal) => void;
  onAddTopic: (goalId: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  topics,
  onAddGoal,
  onDeleteGoal,
  onOpenBreakdown,
  onAddTopic,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    goals.length > 0 ? goals[0].id : ''
  );

  const activeGoal = goals.find((g) => g.id === selectedGoalId) || goals[0];
  const activeTopics = topics.filter((t) => t.goalId === activeGoal?.id);

  const completedTopics = activeTopics.filter((t) => t.status === 'completed');
  const totalEstHours = activeTopics.reduce((sum, t) => sum + (t.estHours || 2), 0);
  const progressPercent =
    activeTopics.length > 0
      ? Math.round((completedTopics.length / activeTopics.length) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border shadow-sm bg-[#fbf8f2] dark:bg-[#121622] border-[#e6dece] dark:border-slate-800 transition-colors duration-200">
        <div>
          <div className="flex items-center space-x-2 text-[#c0392b] text-xs font-medium uppercase tracking-wider mb-1">
            <span>Curriculum Architecture</span>
          </div>
          <h2 className="font-space font-medium text-2xl md:text-3xl tracking-tight text-[#181a1f] dark:text-white">
            Academic Goals & Syllabus Breakdown
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your courses, exams, difficulty weights, and AI syllabus breakdowns.
          </p>
        </div>

        <button
          onClick={onAddGoal}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#c0392b] hover:bg-[#a82d20] text-white font-condensed font-bold text-xs uppercase tracking-wider shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Study Goal</span>
        </button>
      </div>

      {/* Main Grid: Goal Selector & Topic Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Goals List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-condensed font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Goals ({goals.length})
            </span>
          </div>

          {goals.map((g) => {
            const daysLeft = Math.max(0, differenceInDays(parseISO(g.deadline), new Date()));
            const isSelected = g.id === (activeGoal?.id || '');

            return (
              <div
                key={g.id}
                onClick={() => setSelectedGoalId(g.id)}
                className={`p-4 rounded-2xl cursor-pointer border shadow-sm transition-all ${
                  isSelected
                    ? 'border-[#c0392b] bg-[#fff5f5] dark:bg-[#201518] ring-1 ring-[#c0392b]/30'
                    : 'border-[#e6dece] dark:border-slate-800 hover:border-slate-400 bg-[#fbf8f2] dark:bg-[#141824]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: g.color }}
                    />
                    <span className="text-xs uppercase font-condensed font-extrabold text-slate-500">
                      {g.type}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-condensed font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      daysLeft <= 7
                        ? 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'bg-[#ded5c6]/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {daysLeft} days left
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#181a1f] dark:text-white mb-2">{g.title}</h3>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1 font-condensed font-bold uppercase">
                    <Flag className="w-3 h-3 text-[#c0392b]" />
                    <span>Priority {g.priority}/5</span>
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                    {g.targetProficiency}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Goal Topic Tree */}
        <div className="lg:col-span-2 space-y-4">
          {activeGoal ? (
            <div className="p-6 rounded-3xl border shadow-sm bg-[#fbf8f2] dark:bg-[#121622] border-[#e6dece] dark:border-slate-800 space-y-5 transition-colors duration-200">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6dece] dark:border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: activeGoal.color }}
                    />
                    <h3 className="font-serif text-2xl font-bold tracking-tight text-[#181a1f] dark:text-white">
                      {activeGoal.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Deadline: {format(parseISO(activeGoal.deadline), 'MMMM d, yyyy')} • Required Effort: {totalEstHours} Hours
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenBreakdown(activeGoal)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white font-condensed font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Syllabus Import</span>
                  </button>

                  <button
                    onClick={() => onDeleteGoal(activeGoal.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-condensed font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                  <span>Syllabus Completion</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-[#e6dece] dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: activeGoal.color,
                    }}
                  />
                </div>
              </div>

              {/* Topics List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-condensed font-bold text-slate-500 uppercase tracking-wider">
                  <span>Modules & Topics ({activeTopics.length})</span>
                  <span>Difficulty & Effort</span>
                </div>

                {activeTopics.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-[#e6dece] dark:border-slate-800">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No topics added yet. Click "AI Syllabus Import" to generate a calibrated curriculum instantly!
                  </div>
                ) : (
                  activeTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-3.5 rounded-xl border border-[#ded5c6] dark:border-slate-800 bg-white dark:bg-slate-800/80 flex items-center justify-between text-xs hover:border-[#1e5bb5] shadow-sm transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle
                          className={`w-4 h-4 ${
                            topic.status === 'completed'
                              ? 'text-emerald-500'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                        <span
                          className={`font-semibold ${
                            topic.status === 'completed'
                              ? 'line-through text-slate-400'
                              : 'text-[#181a1f] dark:text-white'
                          }`}
                        >
                          {topic.title}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Difficulty */}
                        <div className="flex items-center text-amber-500">
                          {[1, 2, 3, 4, 5].map((d) => (
                            <Star
                              key={d}
                              className={`w-3 h-3 ${
                                d <= topic.difficulty ? 'fill-current' : 'text-slate-200 dark:text-slate-700'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Hours */}
                        <div className="flex items-center space-x-1 font-mono text-slate-600 dark:text-slate-300 font-bold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{topic.estHours}h</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 rounded-3xl border border-[#e6dece] dark:border-slate-800">
              Select or create a study goal to view and edit its topics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

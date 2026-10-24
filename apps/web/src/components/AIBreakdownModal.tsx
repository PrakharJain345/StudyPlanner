import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Loader2,
  Plus,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { Goal } from '@ai-study-planner/shared';
import { api } from '../api/client';

interface AIBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onTopicsSaved: () => void;
}

interface EditableTopic {
  title: string;
  difficulty: number;
  estHours: number;
}

export const AIBreakdownModal: React.FC<AIBreakdownModalProps> = ({
  isOpen,
  onClose,
  goal,
  onTopicsSaved,
}) => {
  if (!isOpen || !goal) return null;

  const [syllabusText, setSyllabusText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [topics, setTopics] = useState<EditableTopic[]>([]);
  const [reasoning, setReasoning] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.generateBreakdown({
        goalId: goal.id,
        title: goal.title,
        syllabusText,
        autoSave: false,
      });

      setTopics(res.breakdown.topics);
      setReasoning(res.breakdown.reasoning);
    } catch (err: any) {
      alert(`Breakdown failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToGoal = async () => {
    if (topics.length === 0) return;
    setSaving(true);
    try {
      for (let i = 0; i < topics.length; i++) {
        await api.createTopic(goal.id, {
          title: topics[i].title,
          difficulty: topics[i].difficulty,
          estHours: topics[i].estHours,
          status: 'not_started',
          order: i,
        });
      }
      onTopicsSaved();
      onClose();
    } catch (err: any) {
      alert(`Failed to save topics: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const removeTopic = (index: number) => {
    setTopics((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTopic = (index: number, field: keyof EditableTopic, value: any) => {
    setTopics((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const addEmptyTopic = () => {
    setTopics((prev) => [...prev, { title: 'New Module', difficulty: 3, estHours: 2.5 }]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel bg-slate-900/95 rounded-2xl border border-slate-700/80 p-6 md:p-8 shadow-2xl glow-primary max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white glow-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>AI Syllabus & Topic Breakdown</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {goal.title}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Paste syllabus text or generate topics instantly with calibrated study estimates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Syllabus Input Form */}
        <div className="my-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Paste Course Syllabus or Topic Outline (Optional)
          </label>
          <textarea
            rows={3}
            value={syllabusText}
            onChange={(e) => setSyllabusText(e.target.value)}
            placeholder="e.g. Unit 1: Graph Theory, BFS/DFS, Topological Sort, Dijkstra; Unit 2: Dynamic Programming, 0/1 Knapsack..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Leave blank to synthesize from the subject title automatically.
            </span>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-600/30 glow-accent transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{topics.length > 0 ? 'Regenerate Breakdown' : 'Generate Modules'}</span>
            </button>
          </div>
        </div>

        {/* Reasoning Note */}
        {reasoning && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300">
            {reasoning}
          </div>
        )}

        {/* Generated Topics Tree */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-4">
          {topics.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs bg-slate-800/20 rounded-xl border border-slate-800/60">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              Click "Generate Modules" to synthesize an optimal topic tree for {goal.title}.
            </div>
          ) : (
            topics.map((t, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs space-x-3"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    value={t.title}
                    onChange={(e) => updateTopic(idx, 'title', e.target.value)}
                    className="w-full bg-transparent text-white font-semibold focus:outline-none focus:border-b border-cyan-500"
                  />
                </div>

                {/* Difficulty */}
                <div className="flex items-center space-x-1 shrink-0">
                  <span className="text-[11px] text-slate-400 mr-1">Diff:</span>
                  <select
                    value={t.difficulty}
                    onChange={(e) => updateTopic(idx, 'difficulty', Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-xs"
                  >
                    <option value={1}>1 (Easy)</option>
                    <option value={2}>2</option>
                    <option value={3}>3 (Med)</option>
                    <option value={4}>4</option>
                    <option value={5}>5 (Hard)</option>
                  </select>
                </div>

                {/* Hours */}
                <div className="flex items-center space-x-1 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={t.estHours}
                    onChange={(e) => updateTopic(idx, 'estHours', Number(e.target.value))}
                    className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-xs text-center"
                  />
                  <span className="text-slate-400">h</span>
                </div>

                <button
                  onClick={() => removeTopic(idx)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={addEmptyTopic}
            className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Module</span>
          </button>

          <div className="flex space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveToGoal}
              disabled={topics.length === 0 || saving}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/30 flex items-center space-x-1.5 disabled:opacity-40 transition-all"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              <span>Attach {topics.length} Topics to Goal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

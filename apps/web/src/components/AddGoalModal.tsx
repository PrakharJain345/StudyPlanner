import React, { useState } from 'react';
import { Calendar, Flag, Sparkles, Target, X } from 'lucide-react';
import { Goal, GoalType, TargetProficiency } from '@ai-study-planner/shared';
import { addDays, format } from 'date-fns';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goalData: {
    title: string;
    type: GoalType;
    deadline: string;
    priority: number;
    targetProficiency: TargetProficiency;
    color: string;
    description: string;
    autoBreakdown: boolean;
  }) => void;
}

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
];

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<GoalType>('exam');
  const [deadline, setDeadline] = useState(format(addDays(new Date(), 21), 'yyyy-MM-dd'));
  const [priority, setPriority] = useState(4);
  const [targetProficiency, setTargetProficiency] = useState<TargetProficiency>('proficient');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [description, setDescription] = useState('');
  const [autoBreakdown, setAutoBreakdown] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      type,
      deadline: `${deadline}T23:59:59.000Z`,
      priority,
      targetProficiency,
      color,
      description,
      autoBreakdown,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel bg-slate-900/95 rounded-2xl border border-slate-700/80 p-6 md:p-7 shadow-2xl glow-primary">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add New Study Goal</h2>
              <p className="text-xs text-slate-400">Define course, exam, or project target</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Subject / Goal Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Computer Networks or GATE CS 2026"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm"
            />
          </div>

          {/* Goal Type & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as GoalType)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              >
                <option value="exam">Semester Exam</option>
                <option value="assignment">Assignment</option>
                <option value="project">Course Project</option>
                <option value="skill">Skill / Certification</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Deadline Date</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Priority & Proficiency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Priority: {priority} / 5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 px-0.5">
                <span>Low</span>
                <span>Urgent</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Proficiency</label>
              <select
                value={targetProficiency}
                onChange={(e) => setTargetProficiency(e.target.value as TargetProficiency)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              >
                <option value="pass">Pass (Solid foundations)</option>
                <option value="proficient">Proficient (Target Grade A)</option>
                <option value="mastery">Mastery (Top Percentile)</option>
              </select>
            </div>
          </div>

          {/* Color Tag Picker */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Color Tag</label>
            <div className="flex items-center space-x-2.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* AI Syllabus Breakdown Checkbox */}
          <div className="p-3 bg-brand-950/40 rounded-xl border border-brand-500/30 flex items-start space-x-2.5 mt-2">
            <input
              type="checkbox"
              id="autoBreakdown"
              checked={autoBreakdown}
              onChange={(e) => setAutoBreakdown(e.target.checked)}
              className="mt-0.5 accent-brand-500 rounded cursor-pointer"
            />
            <label htmlFor="autoBreakdown" className="text-slate-300 cursor-pointer">
              <span className="font-semibold text-brand-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Auto-generate AI Syllabus & Topic Tree</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                AI will build modules with estimated study hours and difficulty levels automatically.
              </p>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-md shadow-brand-600/30 glow-primary transition-all"
            >
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

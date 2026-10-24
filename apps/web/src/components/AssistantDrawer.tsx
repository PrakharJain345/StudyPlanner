import React, { useState } from 'react';
import {
  ArrowRight,
  Bot,
  CalendarX,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { AssistantProposal, Goal } from '@ai-study-planner/shared';
import { api } from '../api/client';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  onProposalApplied: () => void;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  proposal?: AssistantProposal;
  timestamp: string;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  goals,
  onProposalApplied,
}) => {
  if (!isOpen) return null;

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [applyingProposalId, setApplyingProposalId] = useState<string | null>(null);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: `Hello! I'm your AI Study Copilot. How can I adapt your schedule today? You can ask me to block out days when you're busy, shift upcoming revision sessions, extend exam deadlines, or re-plan your week.`,
      timestamp: 'Just now',
    },
  ]);

  const quickPrompts = [
    "I'm sick today, clear my schedule",
    "I'm busy this Saturday for an event",
    "Extend Data Structures deadline by 1 week",
    "Re-plan my study schedule",
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: MessageItem = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.sendAssistantMessage(textToSend);
      const assistantMsg: MessageItem = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        proposal: response.proposal,
        timestamp: 'Now',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `Sorry, I encountered an issue processing that: ${err.message || 'Unknown error'}. Please try again.`,
          timestamp: 'Now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyProposal = async (proposal: AssistantProposal) => {
    setApplyingProposalId(proposal.id);
    try {
      await api.applyAssistantProposal(proposal.actionType, proposal.details);
      setMessages((prev) => [
        ...prev,
        {
          id: `done_${Date.now()}`,
          sender: 'assistant',
          text: `✅ Changes successfully applied! Your study plan has been updated and synchronized with the latest constraints.`,
          timestamp: 'Now',
        },
      ]);
      onProposalApplied();
    } catch (err: any) {
      alert(`Failed to apply proposal: ${err.message}`);
    } finally {
      setApplyingProposalId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md h-full glass-panel bg-slate-900/95 border-l border-slate-700/80 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-brand-500 flex items-center justify-center text-white glow-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AI Study Copilot</h3>
              <p className="text-[11px] text-cyan-400">Natural language schedule adjustments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-3 bg-slate-950/50 border-b border-slate-800/80 overflow-x-auto flex space-x-2 scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700/60 transition-all shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {/* Proposal Action Card */}
                {m.proposal && (
                  <div className="mt-3 p-3 bg-slate-900/90 rounded-xl border border-brand-500/40 glow-primary">
                    <div className="flex items-center space-x-1.5 text-brand-300 font-semibold mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                      <span>Proposed Schedule Action</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mb-2.5">{m.proposal.description}</p>
                    <button
                      onClick={() => handleApplyProposal(m.proposal!)}
                      disabled={applyingProposalId === m.proposal.id}
                      className="w-full py-1.5 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-brand-600/30 transition-all"
                    >
                      {applyingProposalId === m.proposal.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      <span>Confirm & Apply Changes</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 pl-9">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Analyzing constraints & schedule...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. I have a dentist appointment Thursday..."
              className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-colors shadow-md shadow-cyan-600/30 glow-accent"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

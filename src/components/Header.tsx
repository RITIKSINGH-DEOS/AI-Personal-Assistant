import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { AssistantSettings, UserProfile, VoiceState } from '../types';

interface HeaderProps {
  user: UserProfile;
  settings: AssistantSettings;
  voiceState: VoiceState;
  onVoiceTrigger: () => void;
  onOpenNewTask: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onResetTasks: () => void;
  voiceResponsesEnabled: boolean;
  onToggleVoiceResponse: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  settings,
  voiceState,
  onVoiceTrigger,
  onOpenNewTask,
  searchQuery,
  setSearchQuery,
  onResetTasks,
  voiceResponsesEnabled,
  onToggleVoiceResponse
}) => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getVoiceStateBadge = () => {
    switch (voiceState) {
      case 'listening':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-mono font-medium animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            Listening...
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-medium animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            AI Processing
          </span>
        );
      case 'speaking':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-medium">
            <Volume2 className="w-3.5 h-3.5 animate-bounce" />
            Speaking...
          </span>
        );
      case 'paused':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-mono font-medium">
            Muted
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Wake: &quot;{settings.wakeWord}&quot;
          </span>
        );
    }
  };

  return (
    <header id="app-header" className="h-16 border-b border-slate-800/80 bg-[#0d0f17]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Search & Time */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search tasks, meetings, study notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
          />
        </div>
      </div>

      {/* Center: Live Clock & Date */}
      <div className="hidden lg:flex items-center gap-3 px-4 py-1 rounded-xl bg-slate-900/60 border border-slate-800/80 font-mono text-xs text-slate-300 shadow-inner">
        <span className="text-indigo-400 font-semibold">{dateStr}</span>
        <span className="text-slate-600">•</span>
        <span className="font-bold text-white tracking-wider">{time}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Voice State Badge */}
        {getVoiceStateBadge()}

        {/* Voice Response Toggle */}
        <button
          id="btn-toggle-voice-output"
          onClick={onToggleVoiceResponse}
          title={voiceResponsesEnabled ? 'Voice Responses Enabled' : 'Voice Responses Muted'}
          className={`p-2 rounded-xl border transition-all ${
            voiceResponsesEnabled
              ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          {voiceResponsesEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Mic Activation Button */}
        <button
          id="btn-header-mic-action"
          onClick={onVoiceTrigger}
          className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all shadow-sm ${
            voiceState === 'listening'
              ? 'bg-red-500 text-white border-red-400 shadow-red-500/30 animate-pulse'
              : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white border-indigo-400/30 shadow-indigo-500/20'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>{voiceState === 'listening' ? 'Listening...' : `Say "${settings.wakeWord}"`}</span>
        </button>

        {/* Add Task Button */}
        <button
          id="btn-header-add-task"
          onClick={onOpenNewTask}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 flex items-center gap-1.5 text-xs font-semibold transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Add Task</span>
        </button>

        {/* Reset / Reload Sample Tasks */}
        <button
          id="btn-header-reset-sample"
          onClick={onResetTasks}
          title="Reset tasks to standard template"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-md">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
            <p className="text-[10px] text-slate-400 leading-tight">Personal Plan</p>
          </div>
        </div>
      </div>
    </header>
  );
};

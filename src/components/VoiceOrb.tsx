import React from 'react';
import { Mic, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { VoiceState } from '../types';

interface VoiceOrbProps {
  voiceState: VoiceState;
  onToggle: () => void;
  assistantName: string;
  wakeWord: string;
  transcript: string;
  isInterim: boolean;
  onSamplePromptClick?: (prompt: string) => void;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  voiceState,
  onToggle,
  assistantName,
  wakeWord,
  transcript,
  isInterim,
  onSamplePromptClick
}) => {
  const getOrbGlowClass = () => {
    switch (voiceState) {
      case 'listening':
        return 'from-red-500 via-rose-600 to-pink-500 shadow-red-500/40 ring-red-500/40 scale-105 animate-pulse';
      case 'processing':
        return 'from-amber-400 via-yellow-500 to-orange-500 shadow-amber-500/40 ring-amber-500/40 scale-100 animate-spin';
      case 'speaking':
        return 'from-cyan-400 via-indigo-500 to-purple-600 shadow-cyan-500/40 ring-cyan-500/40 scale-105';
      case 'paused':
        return 'from-slate-700 via-slate-800 to-slate-900 shadow-slate-900/20 ring-slate-700/20 opacity-60';
      default:
        return 'from-indigo-600 via-violet-600 to-cyan-500 shadow-indigo-500/30 ring-indigo-500/30 hover:scale-105';
    }
  };

  const getStatusText = () => {
    switch (voiceState) {
      case 'listening':
        return `Listening... Say your command or ask about tasks`;
      case 'processing':
        return `${assistantName} is processing your request...`;
      case 'speaking':
        return `${assistantName} is speaking...`;
      case 'paused':
        return `Voice listener is paused`;
      default:
        return `Say "${wakeWord}" or tap to speak`;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-950/80 border border-indigo-900/40 p-6 flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-sm">
      {/* Background ambient decorative mesh */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Meta info */}
      <div className="flex items-center gap-2 mb-4 font-mono text-[11px] text-slate-400">
        <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300">
          Wake: &quot;{wakeWord}&quot;
        </span>
        <span>•</span>
        <span className="text-indigo-400 font-semibold uppercase tracking-wider">{voiceState}</span>
      </div>

      {/* Main Interactive Orb */}
      <div className="relative my-2 cursor-pointer select-none group" onClick={onToggle}>
        {/* Pulsing Outer Rings */}
        {voiceState === 'listening' && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping duration-1000" />
            <div className="absolute -inset-4 rounded-full border border-red-500/30 animate-pulse duration-700" />
            <div className="absolute -inset-8 rounded-full border border-red-500/20 animate-ping duration-1500" />
          </>
        )}

        {voiceState === 'speaking' && (
          <>
            <div className="absolute -inset-3 rounded-full bg-cyan-500/20 animate-pulse duration-1000" />
            <div className="absolute -inset-6 rounded-full border border-indigo-500/30 animate-spin duration-3000" />
          </>
        )}

        {/* Central Sphere */}
        <div
          className={`w-28 h-28 rounded-full bg-gradient-to-tr ${getOrbGlowClass()} shadow-2xl ring-4 flex items-center justify-center transition-all duration-500 relative z-10`}
        >
          <div className="w-20 h-20 rounded-full bg-[#0d0f17]/40 backdrop-blur-sm flex items-center justify-center text-white">
            {voiceState === 'listening' ? (
              <Mic className="w-8 h-8 text-white animate-pulse" />
            ) : voiceState === 'processing' ? (
              <Sparkles className="w-8 h-8 text-amber-300 animate-spin" />
            ) : voiceState === 'speaking' ? (
              <Volume2 className="w-8 h-8 text-cyan-300 animate-bounce" />
            ) : voiceState === 'error' ? (
              <AlertCircle className="w-8 h-8 text-rose-400" />
            ) : (
              <Mic className="w-8 h-8 text-indigo-200 group-hover:text-white transition-colors" />
            )}
          </div>
        </div>
      </div>

      {/* Status Header */}
      <h3 className="text-sm font-semibold text-white mt-4 mb-1 tracking-tight">
        {getStatusText()}
      </h3>

      {/* Live Transcript / Subtitle Preview */}
      <div className="min-h-[40px] max-w-md w-full flex items-center justify-center px-4 my-2">
        {transcript ? (
          <p className="text-xs text-indigo-200 font-mono bg-indigo-950/60 border border-indigo-800/60 rounded-xl px-4 py-2 w-full text-center shadow-inner">
            &quot;{transcript}&quot; {isInterim && <span className="animate-pulse">...</span>}
          </p>
        ) : (
          <p className="text-xs text-slate-400">
            Supports Hindi, English, and Hinglish naturally.
          </p>
        )}
      </div>

      {/* Quick Prompt Pills for Fast Voice/Click Testing */}
      {onSamplePromptClick && (
        <div className="mt-3 flex flex-wrap justify-center gap-2 max-w-xl">
          {[
            'Kal 10 baje DSA add kar do',
            'Aaj ke saare pending tasks batao',
            'Kal mera kya schedule hai?',
            'DSA wala task complete kar do',
            'Website task ko 5 baje shift kar do'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSamplePromptClick(prompt)}
              className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-900/80 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-700/60 transition-all cursor-pointer shadow-sm"
            >
              &quot;{prompt}&quot;
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

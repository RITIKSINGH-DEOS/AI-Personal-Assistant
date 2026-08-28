import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Volume2,
  Trash2,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Calendar,
  Clock,
  Terminal,
  RotateCcw
} from 'lucide-react';
import { ChatMessage, AssistantSettings, UserProfile, VoiceState } from '../types';

interface AIAssistantViewProps {
  user: UserProfile;
  settings: AssistantSettings;
  messages: ChatMessage[];
  voiceState: VoiceState;
  onSendMessage: (text: string) => Promise<void>;
  onVoiceTrigger: () => void;
  onClearHistory: () => void;
  onSpeakText: (text: string) => void;
  transcript: string;
  isInterim: boolean;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  user,
  settings,
  messages,
  voiceState,
  onSendMessage,
  onVoiceTrigger,
  onClearHistory,
  onSpeakText,
  transcript,
  isInterim
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, transcript]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);
    try {
      await onSendMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const handlePromptClick = async (prompt: string) => {
    if (isSending) return;
    setIsSending(true);
    try {
      await onSendMessage(prompt);
    } finally {
      setIsSending(false);
    }
  };

  const samplePrompts = [
    { title: 'Add Task (Hinglish)', text: 'Kal subah 10 baje DSA padhna hai' },
    { title: "Today's Agenda", text: 'Aaj ke saare pending tasks batao' },
    { title: 'Schedule YouTube', text: 'Saturday ko YouTube video edit karni hai' },
    { title: 'Complete Task', text: 'DSA wala task complete kar do' },
    { title: 'Reschedule Task', text: 'Website wala task 3 baje ki jagah 5 baje shift kar do' },
    { title: "Tomorrow's Schedule", text: 'Kal mera kya kya kaam hai?' }
  ];

  return (
    <div id="ai-assistant-view" className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto pb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{settings.assistantName} AI Assistant</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Online
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Wake word: &quot;{settings.wakeWord}&quot; • Natural Language & Tool Calling Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearHistory}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear History</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 rounded-2xl bg-[#0b0d14]/80 border border-slate-800/80 p-6 backdrop-blur-md shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-indigo-600/30">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-bl-none'
                }`}
              >
                {/* User / Assistant Header */}
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <span className="text-[11px] font-mono font-semibold opacity-70">
                    {isUser ? user.name : settings.assistantName}
                  </span>
                  <span className="text-[10px] font-mono opacity-50">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Content */}
                <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>

                {/* Tool Call Log Pill if executed */}
                {msg.toolCall && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-indigo-900/50 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-indigo-300 font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-indigo-400" />
                        Tool: {msg.toolCall.name}()
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Executed
                      </span>
                    </div>

                    {msg.toolCall.result?.task && (
                      <div className="mt-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                        <p className="font-semibold text-white">{msg.toolCall.result.task.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Date: {msg.toolCall.result.task.date} {msg.toolCall.result.task.startTime ? `at ${msg.toolCall.result.task.startTime}` : ''}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Assistant Voice Playback Button */}
                {!isUser && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-end">
                    <button
                      onClick={() => onSpeakText(msg.content)}
                      className="text-[11px] text-indigo-300 hover:text-white flex items-center gap-1 font-mono transition-colors"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Speak</span>
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Live Interim Transcript */}
        {transcript && (
          <div className="flex gap-3.5 justify-end">
            <div className="max-w-md rounded-2xl p-3 bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs font-mono animate-pulse">
              <p className="text-[10px] text-indigo-400 font-bold uppercase mb-0.5">Live Voice Input...</p>
              &quot;{transcript}&quot; {isInterim && '...'}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isSending && (
          <div className="flex gap-3.5 items-center text-slate-400 text-xs font-mono p-2">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>{settings.assistantName} is processing and calling database tools...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto py-2.5 shrink-0 scrollbar-none">
        <span className="text-[11px] font-mono text-slate-400 shrink-0">Try voice or click:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handlePromptClick(p.text)}
            className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-900 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-800/60 transition-all shrink-0 cursor-pointer shadow-sm"
          >
            {p.text}
          </button>
        ))}
      </div>

      {/* Chat & Voice Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 shrink-0">
        <div className="relative flex-1">
          <input
            id="ai-assistant-input-box"
            type="text"
            placeholder={`Ask ${settings.assistantName} in Hindi, English, or Hinglish (e.g. "Kal 10 baje DSA add kar do")...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-4 pr-12 py-3 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-lg"
          />
        </div>

        {/* Mic Toggle Button */}
        <button
          type="button"
          onClick={onVoiceTrigger}
          className={`p-3 rounded-2xl border transition-all shadow-md ${
            voiceState === 'listening'
              ? 'bg-red-500 text-white border-red-400 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50'
          }`}
          title={voiceState === 'listening' ? 'Listening...' : `Click or Say "${settings.wakeWord}"`}
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

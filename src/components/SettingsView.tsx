import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Mic,
  Volume2,
  Bell,
  Shield,
  Clock,
  Save,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { AssistantSettings, ReminderType } from '../types';

interface SettingsViewProps {
  settings: AssistantSettings;
  onUpdateSettings: (updates: Partial<AssistantSettings>) => Promise<void>;
  onClearHistory: () => Promise<void>;
  onResetTasks: () => Promise<void>;
  onTestVoice: (text: string) => void;
  availableVoices: SpeechSynthesisVoice[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearHistory,
  onResetTasks,
  onTestVoice,
  availableVoices
}) => {
  const [assistantName, setAssistantName] = useState(settings.assistantName);
  const [wakeWord, setWakeWord] = useState(settings.wakeWord);
  const [voice, setVoice] = useState(settings.voice);
  const [speechSpeed, setSpeechSpeed] = useState(settings.speechSpeed);
  const [volume, setVolume] = useState(settings.volume);
  const [language, setLanguage] = useState(settings.language);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);
  const [voiceResponsesEnabled, setVoiceResponsesEnabled] = useState(settings.voiceResponsesEnabled);
  const [desktopNotificationsEnabled, setDesktopNotificationsEnabled] = useState(settings.desktopNotificationsEnabled);
  const [defaultReminder, setDefaultReminder] = useState<ReminderType>(settings.defaultReminder);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setAssistantName(settings.assistantName);
    setWakeWord(settings.wakeWord);
    setVoice(settings.voice);
    setSpeechSpeed(settings.speechSpeed);
    setVolume(settings.volume);
    setLanguage(settings.language);
    setTimezone(settings.timezone);
    setNotificationsEnabled(settings.notificationsEnabled);
    setVoiceResponsesEnabled(settings.voiceResponsesEnabled);
    setDesktopNotificationsEnabled(settings.desktopNotificationsEnabled);
    setDefaultReminder(settings.defaultReminder);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateSettings({
        assistantName: assistantName.trim() || 'Nova',
        wakeWord: wakeWord.trim() || 'Nova',
        voice,
        speechSpeed,
        volume,
        language,
        timezone,
        notificationsEnabled,
        voiceResponsesEnabled,
        desktopNotificationsEnabled,
        defaultReminder
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const presetWakeWords = ['Nova', 'Jarvis', 'Friday', 'Alex', 'Assistant'];

  return (
    <div id="settings-view" className="flex flex-col gap-6 max-w-4xl mx-auto pb-16">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-indigo-400" />
            <span>Assistant & System Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure dynamic wake word, voice preferences, notifications, and privacy options.
          </p>
        </div>

        {saveSuccess && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            Saved & Synchronized!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Section 1: Configurable Assistant Name & Dynamic Wake Word */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/30 via-slate-900/80 to-slate-900/90 border border-indigo-900/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Assistant Name & Dynamic Wake Word
                </h3>
                <p className="text-xs text-slate-400">
                  Changes apply immediately to both web dashboard and background companion.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Active: &quot;{wakeWord}&quot;
            </span>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Preset or Type Custom Wake Word
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {presetWakeWords.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setAssistantName(name);
                    setWakeWord(name);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all ${
                    wakeWord.toLowerCase() === name.toLowerCase()
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-indigo-500/40'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Assistant Display Name
              </label>
              <input
                type="text"
                required
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                placeholder="e.g. Nova, Jarvis, Friday"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Spoken Wake Word
              </label>
              <input
                type="text"
                required
                value={wakeWord}
                onChange={(e) => setWakeWord(e.target.value)}
                placeholder="e.g. Nova, Jarvis, Friday"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 font-mono">
            ℹ️ If you change <strong className="text-white">&quot;{settings.wakeWord}&quot; → &quot;{wakeWord}&quot;</strong>, saying &quot;{wakeWord}&quot; will activate the assistant, while &quot;{settings.wakeWord}&quot; will be deactivated automatically.
          </p>
        </div>

        {/* Section 2: Voice & Speech Synthesis */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Voice & Speech Synthesis</h3>
                <p className="text-xs text-slate-400">Configure text-to-speech engine, pitch, and playback rate.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onTestVoice(`Hello Ritik! This is ${assistantName}. Your tasks and schedule are synchronized.`)}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 border border-slate-700/80 flex items-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Voice</span>
            </button>
          </div>

          {/* Voice selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Synthesizer Voice
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {availableVoices.length > 0 ? (
                availableVoices.map((v, i) => (
                  <option key={i} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))
              ) : (
                <option value="default">Default System Voice</option>
              )}
            </select>
          </div>

          {/* Sliders: Speech Speed & Volume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Speech Speed</span>
                <span className="font-mono text-indigo-400">{speechSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.1"
                value={speechSpeed}
                onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Volume</span>
                <span className="font-mono text-indigo-400">{volume}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Language & Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Language Model Preference
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="en-IN">Indian English & Hinglish (en-IN)</option>
                <option value="hi-IN">Hindi (hi-IN)</option>
                <option value="en-US">US English (en-US)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                <option value="UTC">UTC (+0:00)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Notification Toggles */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Notifications & Reminders</h3>
              <p className="text-xs text-slate-400">Control alert frequency and desktop popup notifications.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-white">Enable Task Reminders</p>
                <p className="text-[11px] text-slate-400">Play sound chimes and show banners before scheduled tasks.</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-white">Voice Responses Aloud</p>
                <p className="text-[11px] text-slate-400">Speak assistant answers through speech synthesis.</p>
              </div>
              <input
                type="checkbox"
                checked={voiceResponsesEnabled}
                onChange={(e) => setVoiceResponsesEnabled(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-white">Desktop System Notifications</p>
                <p className="text-[11px] text-slate-400">Send OS-level notification popups from background companion.</p>
              </div>
              <input
                type="checkbox"
                checked={desktopNotificationsEnabled}
                onChange={(e) => setDesktopNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Section 4: Privacy & Data Controls */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Privacy & Local Data Controls</h3>
              <p className="text-xs text-slate-400">Manage conversation records and test fixtures.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onClearHistory}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-700/50 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Conversation History</span>
            </button>

            <button
              type="button"
              onClick={onResetTasks}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Tasks to Demo Template</span>
            </button>
          </div>
        </div>

        {/* Sticky Save Bar */}
        <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-indigo-900/50 flex items-center justify-between shadow-2xl">
          <div className="text-xs text-slate-300">
            Current Wake Word: <strong className="text-white font-mono font-bold">&quot;{wakeWord}&quot;</strong>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

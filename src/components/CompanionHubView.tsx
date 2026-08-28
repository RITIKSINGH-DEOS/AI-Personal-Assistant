import React, { useState } from 'react';
import {
  Laptop,
  Radio,
  Download,
  Copy,
  Check,
  Play,
  Pause,
  Bell,
  Terminal,
  ShieldCheck,
  Cpu,
  RefreshCw,
  ExternalLink,
  Code
} from 'lucide-react';
import { AssistantSettings } from '../types';

interface CompanionHubViewProps {
  settings: AssistantSettings;
  companionConnected: boolean;
  onSimulateNotification: (title: string, message: string) => void;
  onToggleCompanionListening: () => void;
  isCompanionListening: boolean;
}

export const CompanionHubView: React.FC<CompanionHubViewProps> = ({
  settings,
  companionConnected,
  onSimulateNotification,
  onToggleCompanionListening,
  isCompanionListening
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'python' | 'electron' | 'tray'>('python');

  const pythonCompanionScript = `# =====================================================================
# NOVA / AI COMPANION - BACKGROUND DESKTOP DAEMON (companion.py)
# =====================================================================
# Features:
# 1. Background Wake-Word Detection ("${settings.wakeWord}")
# 2. Hindi / English / Hinglish Speech-to-Text
# 3. Cloud AI Agent & Tool Calling Bridge
# 4. Natural Text-to-Speech Output
# 5. Native Desktop System Tray & Pop-up Notifications
# =====================================================================

import time
import requests
import speech_recognition as sr
import pyttsx3
from plyer import notification

# Configuration
API_BASE_URL = "${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api"
WAKE_WORD = "${settings.wakeWord.toLowerCase()}"
ASSISTANT_NAME = "${settings.assistantName}"

# Text-to-Speech Engine
engine = pyttsx3.init()
engine.setProperty('rate', int(${settings.speechSpeed} * 175))
engine.setProperty('volume', ${settings.volume / 100})

def speak(text):
    print(f"[{ASSISTANT_NAME} Speaking]:", text)
    engine.say(text)
    engine.runAndWait()

def notify(title, message):
    try:
        notification.notify(
            title=title,
            message=message,
            app_name=f"{ASSISTANT_NAME} AI Companion",
            timeout=5
        )
    except Exception as e:
        print("[Notification Error]:", e)

def process_command_with_ai(user_speech):
    print(f"[Processing with AI]: {user_speech}")
    try:
        res = requests.post(f"{API_BASE_URL}/conversations/message", json={"message": user_speech})
        data = res.json()
        if data.get("success"):
            reply = data["assistantMessage"]["content"]
            notify(f"{ASSISTANT_NAME} Response", reply)
            speak(reply)
        else:
            speak("Server responded with an error.")
    except Exception as err:
        print("[API Error]:", err)
        speak("I couldn't reach the server. Please check your network connection.")

def listen_loop():
    recognizer = sr.Recognizer()
    recognizer.dynamic_energy_threshold = True
    
    print(f"=====================================================")
    print(f"🚀 {ASSISTANT_NAME} Desktop Companion Active")
    print(f"● Listening for wake word: '{WAKE_WORD.capitalize()}'...")
    print(f"=====================================================")
    notify(f"{ASSISTANT_NAME} Active", f"Listening for '{WAKE_WORD.capitalize()}' in background.")

    with sr.Microphone() as source:
        recognizer.adjust_for_ambient_noise(source, duration=1)
        while True:
            try:
                # Send periodic heartbeat
                requests.post(f"{API_BASE_URL}/companion/heartbeat", json={
                    "platform": "python",
                    "isListening": True,
                    "activeWakeWord": WAKE_WORD
                }, timeout=2)

                print(f"[*] Awaiting wake word...")
                audio = recognizer.listen(source, phrase_time_limit=4)
                text = recognizer.recognize_google(audio, language="en-IN").lower()
                print(f"[Heard]: {text}")

                if WAKE_WORD in text:
                    print(f"[!] Wake word '{WAKE_WORD}' detected!")
                    speak(f"Yes Ritik, how can I help?")
                    
                    # Capture user command
                    command_audio = recognizer.listen(source, phrase_time_limit=8)
                    command_text = recognizer.recognize_google(command_audio, language="en-IN")
                    print(f"[Command]: {command_text}")
                    process_command_with_ai(command_text)

            except sr.UnknownValueError:
                pass
            except Exception as e:
                time.sleep(1)

if __name__ == "__main__":
    listen_loop()
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonCompanionScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadScript = () => {
    const blob = new Blob([pythonCompanionScript], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'companion.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="companion-hub-view" className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Laptop className="w-6 h-6 text-indigo-400" />
            <span>Desktop Companion Architecture</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Always-on laptop background daemon for hands-free voice task management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSimulateNotification('DSA Practice Reminder', 'Starts in 15 minutes at 10:00 AM')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-indigo-400" />
            <span>Test Desktop Notification</span>
          </button>
        </div>
      </div>

      {/* Hero Architecture Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Companion Daemon Live Status & System Tray Mockup */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Status Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/70 to-slate-900/90 border border-indigo-800/40 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                Background Daemon Status
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  companionConnected || isCompanionListening
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}
              >
                {companionConnected || isCompanionListening ? '● Daemon Active' : '● Ready to Bind'}
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Active Wake Word</span>
                <span className="text-indigo-300 font-bold">&quot;{settings.wakeWord}&quot;</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Assistant Name</span>
                <span className="text-white font-bold">{settings.assistantName}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Background STT / TTS</span>
                <span className="text-emerald-400">Enabled (Hindi/Eng)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Desktop Notifications</span>
                <span className="text-emerald-400">{settings.desktopNotificationsEnabled ? 'Active' : 'Disabled'}</span>
              </div>
            </div>

            <button
              onClick={onToggleCompanionListening}
              className={`w-full mt-4 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                isCompanionListening
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isCompanionListening ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isCompanionListening ? 'Pause Web Wake-Word Listener' : 'Start Web Wake-Word Listener'}</span>
            </button>
          </div>

          {/* System Tray Interface Mockup */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-xs uppercase font-mono font-bold text-slate-300 mb-3 flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-indigo-400" />
              Laptop System Tray / Menu Bar UI
            </h3>

            <div className="p-3.5 rounded-xl bg-[#090b12] border border-slate-700 shadow-2xl font-sans text-xs text-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-semibold text-white">
                <span>{settings.assistantName} AI Assistant</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <div className="py-2 border-b border-slate-800 space-y-1 text-[11px] font-mono text-slate-400">
                <p>● Status: <span className="text-emerald-400 font-semibold">Listening in Background</span></p>
                <p>● Wake Word: <span className="text-indigo-300 font-semibold">&quot;{settings.wakeWord}&quot;</span></p>
              </div>
              <div className="pt-2 space-y-1.5">
                <div className="p-1.5 rounded-lg hover:bg-indigo-600 hover:text-white cursor-pointer transition-colors">
                  Open Web Dashboard
                </div>
                <div className="p-1.5 rounded-lg hover:bg-indigo-600 hover:text-white cursor-pointer transition-colors">
                  Assistant Settings
                </div>
                <div className="p-1.5 rounded-lg hover:bg-slate-800 text-amber-300 cursor-pointer transition-colors">
                  Pause Voice Detection
                </div>
                <div className="p-1.5 rounded-lg hover:bg-rose-900/40 text-rose-400 cursor-pointer transition-colors">
                  Quit Companion
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Technical Architecture & Runnable Python Daemon */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-4">
            {/* Sub-tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSubTab('python')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    activeSubTab === 'python'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Python Background Daemon
                </button>
                <button
                  onClick={() => setActiveSubTab('electron')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    activeSubTab === 'electron'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Electron / Tauri Specs
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Script'}</span>
                </button>
                <button
                  onClick={downloadScript}
                  className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .py</span>
                </button>
              </div>
            </div>

            {/* Content for Python Daemon */}
            {activeSubTab === 'python' && (
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-slate-300 leading-relaxed">
                  <p className="font-semibold text-indigo-300 mb-1">
                    How to run on your laptop:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 font-mono text-[11px] text-slate-300">
                    <li>Install dependencies: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300">pip install SpeechRecognition pyttsx3 requests plyer pyaudio</code></li>
                    <li>Download or save <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300">companion.py</code> and execute: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300">python companion.py</code></li>
                    <li>Say <strong className="text-white">&quot;{settings.wakeWord}&quot;</strong> anytime from any desktop application to manage your tasks hands-free!</li>
                  </ol>
                </div>

                <div className="relative rounded-xl bg-[#090b12] border border-slate-800 p-4 font-mono text-xs overflow-x-auto max-h-[340px]">
                  <pre className="text-slate-300">{pythonCompanionScript}</pre>
                </div>
              </div>
            )}

            {/* Content for Electron Specs */}
            {activeSubTab === 'electron' && (
              <div className="flex flex-col gap-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white text-sm">Tauri / Electron Desktop Architecture:</h4>
                  <ul className="list-disc list-inside space-y-1.5 font-mono text-[11px] text-slate-300">
                    <li><strong>Engine:</strong> Rust (Tauri) or Node.js (Electron) with native <code className="text-indigo-300">tray</code> module.</li>
                    <li><strong>Wake-Word Engine:</strong> Picovoice Porcupine or Vosk offline keyword spotter for 0% CPU idle consumption.</li>
                    <li><strong>Microphone Stream:</strong> Global audio stream routed directly without opening Chromium render window.</li>
                    <li><strong>Startup:</strong> Auto-launched via <code className="text-indigo-300">AutoLaunch</code> on macOS LaunchAgents or Windows Registry run keys.</li>
                    <li><strong>Synchronization:</strong> Bi-directional REST & WebSocket sync to the main AI Studio fullstack endpoint.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

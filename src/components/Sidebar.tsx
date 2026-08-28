import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Bot,
  CheckCircle2,
  Laptop,
  Settings,
  Mic,
  Radio
} from 'lucide-react';
import { AssistantSettings } from '../types';

export type ActiveTab = 'dashboard' | 'tasks' | 'calendar' | 'assistant' | 'completed' | 'companion' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: AssistantSettings;
  pendingTasksCount: number;
  companionConnected: boolean;
  onVoiceTrigger: () => void;
  isListening: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  pendingTasksCount,
  companionConnected,
  onVoiceTrigger,
  isListening
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" />, badge: pendingTasksCount },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { id: 'assistant', label: `${settings.assistantName} AI`, icon: <Bot className="w-5 h-5" /> },
    { id: 'completed', label: 'Completed', icon: <CheckCircle2 className="w-5 h-5" /> },
    { id: 'companion', label: 'Desktop Companion', icon: <Laptop className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside id="main-sidebar" className="w-64 border-r border-slate-800/80 bg-[#0d0f17] flex flex-col justify-between p-4 select-none shrink-0 h-screen sticky top-0">
      <div className="flex flex-col gap-6">
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                {settings.assistantName}
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI OS
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Wake: &quot;{settings.wakeWord}&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Quick Voice Trigger Banner */}
        <button
          id="btn-sidebar-quick-mic"
          onClick={onVoiceTrigger}
          className={`w-full p-3 rounded-xl border transition-all duration-300 flex items-center justify-between text-left ${
            isListening
              ? 'bg-red-500/15 border-red-500/40 text-red-300 shadow-lg shadow-red-500/10'
              : 'bg-indigo-950/40 hover:bg-indigo-900/40 border-indigo-800/50 text-indigo-200 shadow-md shadow-indigo-950/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-500/30 text-indigo-300'}`}>
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                {isListening ? 'Listening...' : `Speak to ${settings.assistantName}`}
              </p>
              <p className="text-[10px] text-slate-400">
                {isListening ? 'Speak your command now' : `Say "${settings.wakeWord}" or click`}
              </p>
            </div>
          </div>
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Companion Status Card */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/80">
        <div
          onClick={() => setActiveTab('companion')}
          className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-indigo-400" />
              Desktop Daemon
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${
                companionConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${companionConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
              {companionConnected ? 'Active' : 'Ready'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Always-on voice companion for laptop background listening.
          </p>
        </div>

        <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 font-mono">
          <span>v2.5.0-prod</span>
          <span>{settings.timezone.split('/')[1] || 'IST'}</span>
        </div>
      </div>
    </aside>
  );
};

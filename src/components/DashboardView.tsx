import React from 'react';
import {
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Play,
  RotateCcw,
  Check
} from 'lucide-react';
import { Task, AssistantSettings, UserProfile, VoiceState } from '../types';
import { VoiceOrb } from './VoiceOrb';

interface DashboardViewProps {
  user: UserProfile;
  settings: AssistantSettings;
  tasks: Task[];
  voiceState: VoiceState;
  onVoiceTrigger: () => void;
  onCompleteTask: (taskId: string) => void;
  onOpenReschedule: (task: Task) => void;
  onOpenEditTask: (task: Task) => void;
  onOpenNewTask: () => void;
  onSamplePromptClick: (prompt: string) => void;
  transcript: string;
  isInterim: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  settings,
  tasks,
  voiceState,
  onVoiceTrigger,
  onCompleteTask,
  onOpenReschedule,
  onOpenEditTask,
  onOpenNewTask,
  onSamplePromptClick,
  transcript,
  isInterim
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const tomorrowStr = d.toISOString().split('T')[0];

  const todayTasks = tasks.filter(t => t.date === todayStr);
  const completedToday = todayTasks.filter(t => t.status === 'completed');
  const pendingToday = todayTasks.filter(t => t.status === 'pending');
  const tomorrowTasks = tasks.filter(t => t.date === tomorrowStr);

  const completionRate = todayTasks.length > 0
    ? Math.round((completedToday.length / todayTasks.length) * 100)
    : 0;

  // Find next upcoming task today
  const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const nextTask = pendingToday.find(t => t.startTime && t.startTime >= nowTime) || pendingToday[0] || null;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">Urgent</span>;
      case 'high':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">High</span>;
      case 'medium':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Medium</span>;
      default:
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">Low</span>;
    }
  };

  return (
    <div id="dashboard-view" className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Top Welcome Banner & Voice Assistant Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Personalized Greeting & Overview */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full p-6 rounded-2xl bg-gradient-to-br from-[#121524] via-[#0e111d] to-[#090b12] border border-indigo-900/40 shadow-xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI OS Companion
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              {greeting}, <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-200 bg-clip-text text-transparent">{user.name}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              You have <strong className="text-white font-bold">{todayTasks.length} tasks</strong> scheduled for today. <span className="text-emerald-400 font-semibold">{completedToday.length} completed</span> and <span className="text-amber-400 font-semibold">{pendingToday.length} remaining</span>.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-3 my-6">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-medium mb-1">Today's Schedule</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-white font-mono">{todayTasks.length}</span>
                <span className="text-[11px] text-slate-400">tasks</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[11px] text-emerald-400/90 font-medium mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">{completedToday.length}</span>
                <span className="text-[11px] text-slate-400">done</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[11px] text-amber-400/90 font-medium mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Progress
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-amber-400 font-mono">{completionRate}%</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <span>Daily Completion Goal</span>
              <span className="text-indigo-300 font-semibold">{completedToday.length} of {todayTasks.length} Completed</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Voice Orb Center */}
        <div className="lg:col-span-5">
          <VoiceOrb
            voiceState={voiceState}
            onToggle={onVoiceTrigger}
            assistantName={settings.assistantName}
            wakeWord={settings.wakeWord}
            transcript={transcript}
            isInterim={isInterim}
            onSamplePromptClick={onSamplePromptClick}
          />
        </div>
      </div>

      {/* Next Up Hero Card & Schedule Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Up Hero Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/70 to-slate-900/90 border border-indigo-800/40 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5" />
                Next Up Right Now
              </span>
              {nextTask && getPriorityBadge(nextTask.priority)}
            </div>

            {nextTask ? (
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex items-center gap-2 text-indigo-300 font-mono text-xs font-semibold mb-1">
                    <span>{nextTask.startTime || 'Scheduled Today'}</span>
                    {nextTask.endTime && <span>→ {nextTask.endTime}</span>}
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{nextTask.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {nextTask.title}
                  </h3>
                  {nextTask.description && (
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                      {nextTask.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    id="btn-next-task-complete"
                    onClick={() => onCompleteTask(nextTask.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>

                  <button
                    id="btn-next-task-reschedule"
                    onClick={() => onOpenReschedule(nextTask)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Reschedule</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400/60 mb-2 animate-bounce" />
                <p className="text-sm font-semibold text-white">All today&apos;s tasks finished!</p>
                <p className="text-xs text-slate-400 mt-0.5">Great job. You&apos;re completely caught up.</p>
                <button
                  onClick={onOpenNewTask}
                  className="mt-4 px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md"
                >
                  + Add Tomorrow&apos;s Task
                </button>
              </div>
            )}
          </div>

          {/* Tomorrow Preview Teaser */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Tomorrow&apos;s Agenda ({tomorrowTasks.length})
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {tomorrowTasks.length > 0 ? (
              <div className="flex flex-col gap-2">
                {tomorrowTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    onClick={() => onOpenEditTask(task)}
                    className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-mono text-indigo-300 font-semibold w-12 shrink-0">
                        {task.startTime || '--:--'}
                      </span>
                      <span className="text-xs font-medium text-slate-200 truncate max-w-[180px]">
                        {task.title}
                      </span>
                    </div>
                    {getPriorityBadge(task.priority)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">No tasks scheduled yet for tomorrow.</p>
            )}
          </div>
        </div>

        {/* Right: Today's Full Chronological Timeline */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Today&apos;s Schedule</span>
                  <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {todayTasks.length} tasks
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Chronological timeline of your commitments.</p>
              </div>

              <button
                onClick={onOpenNewTask}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
              >
                + New Task
              </button>
            </div>

            {/* Task List */}
            {todayTasks.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {todayTasks.map((task) => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 group ${
                        isDone
                          ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                          : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-slate-700 shadow-sm'
                      }`}
                    >
                      {/* Checkbox & Time / Title */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => onCompleteTask(task.id)}
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'border-slate-700 hover:border-indigo-500 text-transparent hover:text-slate-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div className="flex flex-col min-w-0 flex-1 cursor-pointer" onClick={() => onOpenEditTask(task)}>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono font-bold ${isDone ? 'text-slate-400 line-through' : 'text-indigo-300'}`}>
                              {task.startTime || 'All Day'}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                              {task.category}
                            </span>
                          </div>
                          <p className={`text-xs font-semibold truncate ${isDone ? 'text-slate-400 line-through' : 'text-white'}`}>
                            {task.title}
                          </p>
                        </div>
                      </div>

                      {/* Right Meta & Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {getPriorityBadge(task.priority)}
                        <button
                          onClick={() => onOpenReschedule(task)}
                          className="text-[11px] text-slate-400 hover:text-indigo-300 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition-colors"
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm">No tasks for today yet.</p>
                <button
                  onClick={onOpenNewTask}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Create Today&apos;s First Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

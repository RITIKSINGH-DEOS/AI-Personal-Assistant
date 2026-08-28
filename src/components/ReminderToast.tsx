import React from 'react';
import { Bell, Clock, Check, X } from 'lucide-react';
import { Task } from '../types';

interface ReminderToastProps {
  task: Task | null;
  onDismiss: () => void;
  onComplete: (taskId: string) => void;
}

export const ReminderToast: React.FC<ReminderToastProps> = ({
  task,
  onDismiss,
  onComplete
}) => {
  if (!task) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#0e111d] border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-bounce">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <Bell className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
              Upcoming Task Reminder
            </span>
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className="text-sm font-bold text-white truncate mt-0.5">
            {task.title}
          </h4>

          <div className="flex items-center gap-2 text-xs text-slate-300 font-mono mt-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Scheduled: {task.startTime || 'Today'}</span>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800">
            <button
              onClick={() => onComplete(task.id)}
              className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-md transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Done</span>
            </button>
            <button
              onClick={onDismiss}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

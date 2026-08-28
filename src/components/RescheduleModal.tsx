import React, { useState } from 'react';
import { X, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Task } from '../types';

interface RescheduleModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (taskId: string, newDate: string, newTime?: string) => Promise<void>;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  task,
  isOpen,
  onClose,
  onReschedule
}) => {
  const [date, setDate] = useState(task?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(task?.startTime || '10:00');
  const [loading, setLoading] = useState(false);

  const getOffsetDate = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onReschedule(task.id, date, time);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f111a] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Reschedule Task
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs font-semibold text-white mb-1">{task.title}</p>
            <p className="text-[11px] text-slate-400 font-mono">
              Currently: {task.date} {task.startTime ? `at ${task.startTime}` : ''}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              New Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Today', offset: 0 },
                { label: 'Tomorrow', offset: 1 },
                { label: 'This Saturday', offset: (6 - new Date().getDay() + 7) % 7 || 7 },
                { label: 'Next Monday', offset: (1 - new Date().getDay() + 7) % 7 || 7 }
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setDate(getOffsetDate(opt.offset))}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              New Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <span>{loading ? 'Updating...' : 'Confirm Reschedule'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Check
} from 'lucide-react';
import { Task, Priority } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onOpenEditTask: (task: Task) => void;
  onOpenNewTask: () => void;
}

export type CalendarMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onCompleteTask,
  onOpenEditTask,
  onOpenNewTask
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [mode, setMode] = useState<CalendarMode>('month');

  // Navigation helpers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (mode === 'month') d.setMonth(d.getMonth() - 1);
    else if (mode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (mode === 'month') d.setMonth(d.getMonth() + 1);
    else if (mode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startingDayIndex = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const todayStr = new Date().toISOString().split('T')[0];

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'high': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'medium': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Week calculations
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push(d);
    }
    return weekDays;
  };

  const weekDays = getWeekDays();

  return (
    <div id="calendar-view" className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Calendar Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-indigo-400" />
            <span>Productivity Calendar</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize your schedules, deadlines, and active commitments.
          </p>
        </div>

        {/* View Mode & Nav Controls */}
        <div className="flex items-center gap-3">
          {/* Month / Week / Day toggles */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            {(['month', 'week', 'day'] as CalendarMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  mode === m
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenNewTask}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <h2 className="text-base font-bold text-white ml-2 font-mono">
            {mode === 'month'
              ? monthName
              : mode === 'week'
              ? `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
        </div>

        <button
          onClick={handleToday}
          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 border border-slate-700/60"
        >
          Today
        </button>
      </div>

      {/* Month View Grid */}
      {mode === 'month' && (
        <div className="rounded-2xl border border-slate-800 bg-[#0c0e17] overflow-hidden shadow-xl">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/60 text-center font-mono text-xs font-semibold text-slate-400 py-3">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 auto-rows-[120px] divide-x divide-y divide-slate-800/80">
            {/* Empty prefix slots */}
            {Array.from({ length: startingDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="bg-slate-950/40 p-2" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNumber = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
              const dayTasks = tasks.filter(t => t.date === dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  className={`p-2 flex flex-col justify-between transition-colors overflow-hidden group ${
                    isToday ? 'bg-indigo-950/20' : 'hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-400'
                      }`}
                    >
                      {dayNumber}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Task Pills */}
                  <div className="flex flex-col gap-1 my-1 overflow-y-auto max-h-[75px]">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onOpenEditTask(task)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border truncate cursor-pointer transition-all flex items-center gap-1 ${getPriorityColor(
                          task.priority
                        )} ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}
                      >
                        {task.startTime && <span className="font-mono text-[9px]">{task.startTime}</span>}
                        <span className="truncate">{task.title}</span>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[9px] text-slate-400 font-mono pl-1">
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {mode === 'week' && (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          {weekDays.map((d) => {
            const dateStr = d.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const dayTasks = tasks.filter(t => t.date === dateStr);

            return (
              <div
                key={dateStr}
                className={`p-3 rounded-2xl border flex flex-col min-h-[300px] ${
                  isToday
                    ? 'bg-indigo-950/20 border-indigo-500/40 ring-1 ring-indigo-500/20'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="border-b border-slate-800 pb-2 mb-2 text-center">
                  <p className="text-[11px] uppercase font-mono font-semibold text-slate-400">
                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className={`text-base font-bold ${isToday ? 'text-indigo-400' : 'text-white'}`}>
                    {d.getDate()}
                  </p>
                </div>

                <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => onOpenEditTask(task)}
                      className={`p-2 rounded-xl border text-xs cursor-pointer ${getPriorityColor(task.priority)} ${
                        task.status === 'completed' ? 'opacity-50 line-through' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[10px] font-mono mb-0.5 text-slate-300">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{task.startTime || 'All Day'}</span>
                      </div>
                      <p className="font-semibold line-clamp-2">{task.title}</p>
                    </div>
                  ))}
                  {dayTasks.length === 0 && (
                    <p className="text-[11px] text-slate-400 text-center my-auto">No tasks</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day View */}
      {mode === 'day' && (
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <p className="text-xs text-slate-400">
                {tasks.filter(t => t.date === currentDate.toISOString().split('T')[0]).length} tasks scheduled
              </p>
            </div>
            <button
              onClick={onOpenNewTask}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md"
            >
              + Add Task on This Day
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {tasks
              .filter(t => t.date === currentDate.toISOString().split('T')[0])
              .map(task => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onCompleteTask(task.id)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                        task.status === 'completed'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-0.5">
                        <span>{task.startTime || 'All Day'}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">{task.category}</span>
                      </div>
                      <p className={`text-sm font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.title}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenEditTask(task)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                  >
                    Edit
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

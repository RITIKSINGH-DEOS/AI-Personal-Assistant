import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Check,
  RotateCcw,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Bell,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Task, Priority, TaskCategory } from '../types';

interface TasksViewProps {
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenEditTask: (task: Task) => void;
  onOpenReschedule: (task: Task) => void;
  onOpenNewTask: () => void;
}

export type FilterTab = 'all' | 'pending' | 'completed' | 'today' | 'tomorrow' | 'upcoming';

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onCompleteTask,
  onDeleteTask,
  onOpenEditTask,
  onOpenReschedule,
  onOpenNewTask
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const tomorrowStr = d.toISOString().split('T')[0];

  const categories = ['all', 'Work', 'Study', 'Development', 'Content', 'Fitness', 'Personal', 'Other'];

  const filteredTasks = tasks.filter((task) => {
    // Tab filter
    if (activeTab === 'pending' && task.status !== 'pending') return false;
    if (activeTab === 'completed' && task.status !== 'completed') return false;
    if (activeTab === 'today' && task.date !== todayStr) return false;
    if (activeTab === 'tomorrow' && task.date !== tomorrowStr) return false;
    if (activeTab === 'upcoming' && task.date < todayStr) return false;

    // Category filter
    if (selectedCategory !== 'all' && task.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    // Priority filter
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
      return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchCat = task.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    return true;
  });

  const getPriorityBadge = (priority: Priority) => {
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
    <div id="tasks-view" className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Task Management</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {filteredTasks.length} tasks
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize, prioritize, and voice-manage all your daily commitments.
          </p>
        </div>

        <button
          id="btn-tasks-add-new"
          onClick={onOpenNewTask}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Tasks', count: tasks.length },
            { id: 'pending', label: 'Pending', count: tasks.filter(t => t.status === 'pending').length },
            { id: 'today', label: 'Today', count: tasks.filter(t => t.date === todayStr).length },
            { id: 'tomorrow', label: 'Tomorrow', count: tasks.filter(t => t.date === tomorrowStr).length },
            { id: 'upcoming', label: 'Upcoming', count: tasks.filter(t => t.date >= todayStr).length },
            { id: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'completed').length }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FilterTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search inside tasks */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter title, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Category Pills & Priority Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-300'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Priority:
          </span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List Grid */}
      {filteredTasks.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                    : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                {/* Left Side: Checkbox, Title, Category, Description */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => onCompleteTask(task.id)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-700 hover:border-indigo-500 text-transparent hover:text-slate-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {task.category}
                      </span>
                      {getPriorityBadge(task.priority)}
                      {task.reminderTime && task.reminderTime !== 'none' && (
                        <span className="text-[10px] font-mono text-indigo-400 flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          {task.reminderTime}
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onOpenEditTask(task)}
                      className={`text-sm font-semibold cursor-pointer hover:text-indigo-300 transition-colors ${
                        isDone ? 'text-slate-400 line-through' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side: Date, Time & Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {/* Scheduled Date & Time */}
                  <div className="flex flex-col sm:items-end font-mono text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-400" />
                      {task.date === todayStr ? 'Today' : task.date === tomorrowStr ? 'Tomorrow' : task.date}
                    </span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {task.startTime || 'All Day'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenReschedule(task)}
                      title="Reschedule"
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                    <button
                      onClick={() => onOpenEditTask(task)}
                      title="Edit task"
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {deleteConfirmId === task.id ? (
                      <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-800 p-1 rounded-xl">
                        <button
                          onClick={() => {
                            onDeleteTask(task.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 text-slate-400 hover:text-white text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(task.id)}
                        title="Delete task"
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center p-6">
          <AlertCircle className="w-10 h-10 text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-white">No tasks match your selected filter.</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Try adjusting your search terms or create a new task using voice or the button below.
          </p>
          <button
            onClick={onOpenNewTask}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
          >
            + Create New Task
          </button>
        </div>
      )}
    </div>
  );
};

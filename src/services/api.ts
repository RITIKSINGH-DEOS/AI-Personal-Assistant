import { Task, AssistantSettings, UserProfile, ChatMessage, TaskCategory, Priority, ReminderType } from '../types';

export const api = {
  // User
  async getCurrentUser(): Promise<UserProfile> {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    return data.user;
  },

  // Settings
  async getSettings(): Promise<AssistantSettings> {
    const res = await fetch('/api/settings');
    const data = await res.json();
    return data.settings;
  },

  async updateSettings(updates: Partial<AssistantSettings>): Promise<AssistantSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.settings;
  },

  // Tasks
  async getTasks(params?: {
    status?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
    priority?: string;
    search?: string;
  }): Promise<Task[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          query.append(key, value);
        }
      });
    }
    const res = await fetch(`/api/tasks?${query.toString()}`);
    const data = await res.json();
    return data.tasks || [];
  },

  async getTodaySummary(): Promise<{
    date: string;
    total: number;
    pendingCount: number;
    completedCount: number;
    nextTask: Task | null;
    tasks: Task[];
  }> {
    const res = await fetch('/api/tasks/today');
    return res.json();
  },

  async getTomorrowTasks(): Promise<{ date: string; total: number; tasks: Task[] }> {
    const res = await fetch('/api/tasks/tomorrow');
    return res.json();
  },

  async getUpcomingTasks(): Promise<{ range: string; count: number; tasks: Task[] }> {
    const res = await fetch('/api/tasks/upcoming');
    return res.json();
  },

  async createTask(task: {
    title: string;
    description?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    priority?: Priority;
    category?: TaskCategory;
    reminderTime?: ReminderType | string;
  }): Promise<Task> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    const data = await res.json();
    return data.task;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.task;
  },

  async completeTask(id: string): Promise<Task> {
    const res = await fetch(`/api/tasks/${id}/complete`, { method: 'POST' });
    const data = await res.json();
    return data.task;
  },

  async rescheduleTask(id: string, date: string, startTime?: string): Promise<Task> {
    const res = await fetch(`/api/tasks/${id}/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, startTime })
    });
    const data = await res.json();
    return data.task;
  },

  async deleteTask(id: string): Promise<boolean> {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  },

  async resetTasks(): Promise<Task[]> {
    const res = await fetch('/api/tasks/reset', { method: 'POST' });
    const data = await res.json();
    return data.tasks;
  },

  // Conversations / Chat
  async getConversations(): Promise<ChatMessage[]> {
    const res = await fetch('/api/conversations');
    const data = await res.json();
    return data.messages || [];
  },

  async sendMessage(message: string): Promise<{
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    toolCalls: any[];
  }> {
    const res = await fetch('/api/conversations/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return res.json();
  },

  async clearConversations(): Promise<void> {
    await fetch('/api/conversations', { method: 'DELETE' });
  },

  // Companion
  async getCompanionStatus(): Promise<any> {
    const res = await fetch('/api/companion/status');
    return res.json();
  },

  async sendCompanionHeartbeat(data: any): Promise<any> {
    const res = await fetch('/api/companion/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

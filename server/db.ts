import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Task, AssistantSettings, UserProfile, ChatMessage } from '../src/types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface DatabaseSchema {
  users: UserProfile[];
  tasks: Task[];
  settings: AssistantSettings[];
  messages: ChatMessage[];
}

function getTodayString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const DEFAULT_USER: UserProfile = {
  id: 'usr_ritik_default',
  name: 'Ritik',
  email: 'ritikritik4500@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
};

const DEFAULT_SETTINGS: AssistantSettings = {
  id: 'set_default_1',
  userId: DEFAULT_USER.id,
  assistantName: 'Nova',
  wakeWord: 'Nova',
  voice: 'Google UK English Female',
  speechSpeed: 1.0,
  volume: 90,
  language: 'en-IN',
  timezone: 'Asia/Kolkata',
  notificationsEnabled: true,
  voiceResponsesEnabled: true,
  desktopNotificationsEnabled: true,
  defaultReminder: '15_min',
  wakeWordSensitivity: 0.75,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

function getDefaultTasks(userId: string): Task[] {
  const today = getTodayString(0);
  const tomorrow = getTodayString(1);
  const dayAfter = getTodayString(2);
  const nextMonday = getTodayString(4);

  return [
    {
      id: 'tsk_1',
      userId,
      title: 'DSA Practice - Graphs & Dynamic Programming',
      description: 'Solve 3 LeetCode Medium problems and revise Dijkstra algorithm.',
      date: today,
      startTime: '10:00',
      endTime: '11:30',
      priority: 'high',
      category: 'Study',
      status: 'completed',
      reminderTime: '15_min',
      completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_2',
      userId,
      title: 'Team Sync & Product Architecture Review',
      description: 'Discuss companion desktop bridge and voice recognition latency.',
      date: today,
      startTime: '12:00',
      endTime: '12:45',
      priority: 'medium',
      category: 'Work',
      status: 'completed',
      reminderTime: '5_min',
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_3',
      userId,
      title: 'Website Development - Hero & AI Visualizer',
      description: 'Finalize voice sphere animations and full responsiveness.',
      date: today,
      startTime: '15:00',
      endTime: '17:00',
      priority: 'high',
      category: 'Development',
      status: 'pending',
      reminderTime: '15_min',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_4',
      userId,
      title: 'YouTube Video Editing - AI Productivity Setup',
      description: 'Edit B-roll footage, add voiceover subtitles and audio mastering.',
      date: today,
      startTime: '18:00',
      endTime: '19:30',
      priority: 'medium',
      category: 'Content',
      status: 'pending',
      reminderTime: '30_min',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_5',
      userId,
      title: 'Evening Reading & Note Synthesis',
      description: 'Read 20 pages of Designing Data-Intensive Applications.',
      date: today,
      startTime: '21:00',
      endTime: '21:45',
      priority: 'low',
      category: 'Personal',
      status: 'pending',
      reminderTime: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_6',
      userId,
      title: 'DSA Practice - Trees & Trie Structures',
      description: 'Solve binary search tree problems and optimize search prefix operations.',
      date: tomorrow,
      startTime: '10:00',
      endTime: '11:30',
      priority: 'high',
      category: 'Study',
      status: 'pending',
      reminderTime: '15_min',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_7',
      userId,
      title: 'Client Project Homepage Review & Feedback',
      description: 'Present the updated design system with dark mode tokens.',
      date: tomorrow,
      startTime: '13:00',
      endTime: '14:00',
      priority: 'high',
      category: 'Work',
      status: 'pending',
      reminderTime: '15_min',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_8',
      userId,
      title: 'Frontend Component Polish & Performance Audit',
      description: 'Profile bundle size and memory allocation during long voice sessions.',
      date: tomorrow,
      startTime: '16:00',
      endTime: '17:30',
      priority: 'medium',
      category: 'Development',
      status: 'pending',
      reminderTime: '30_min',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_9',
      userId,
      title: 'Gym & Calisthenics Workout',
      description: 'Chest, shoulders, core and mobility stretch routine.',
      date: tomorrow,
      startTime: '19:00',
      endTime: '20:15',
      priority: 'medium',
      category: 'Fitness',
      status: 'pending',
      reminderTime: '15_min',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_10',
      userId,
      title: 'Weekend System Architecture Redesign',
      description: 'Refactor background daemon listener and Porcupine wake word binding.',
      date: dayAfter,
      startTime: '11:00',
      endTime: '13:00',
      priority: 'medium',
      category: 'Development',
      status: 'pending',
      reminderTime: '15_min',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_11',
      userId,
      title: 'Next Week Milestone Planning',
      description: 'Break down sprint goals and release candidate checklist.',
      date: nextMonday,
      startTime: '09:30',
      endTime: '10:30',
      priority: 'high',
      category: 'Work',
      status: 'pending',
      reminderTime: '15_min',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.load();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, initializing default:', err);
      }
    }

    const initialData: DatabaseSchema = {
      users: [DEFAULT_USER],
      tasks: getDefaultTasks(DEFAULT_USER.id),
      settings: [DEFAULT_SETTINGS],
      messages: [
        {
          id: 'msg_welcome',
          role: 'assistant',
          content: `Hi ${DEFAULT_USER.name}! I'm ${DEFAULT_SETTINGS.assistantName}, your personal AI voice assistant and productivity companion. You can speak to me or type naturally to manage your tasks, check schedules, or set reminders. Try saying "${DEFAULT_SETTINGS.wakeWord}, kal mera kya schedule hai?" or asking me to add a task!`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(data: DatabaseSchema) {
    this.ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  private persist() {
    this.saveData(this.data);
  }

  // Users
  getUser(id: string = DEFAULT_USER.id): UserProfile {
    return this.data.users.find(u => u.id === id) || DEFAULT_USER;
  }

  // Settings
  getSettings(userId: string = DEFAULT_USER.id): AssistantSettings {
    let settings = this.data.settings.find(s => s.userId === userId);
    if (!settings) {
      settings = { ...DEFAULT_SETTINGS, userId };
      this.data.settings.push(settings);
      this.persist();
    }
    return settings;
  }

  updateSettings(userId: string, updates: Partial<AssistantSettings>): AssistantSettings {
    let settings = this.getSettings(userId);
    const index = this.data.settings.findIndex(s => s.userId === userId);
    
    const updated = {
      ...settings,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (index !== -1) {
      this.data.settings[index] = updated;
    } else {
      this.data.settings.push(updated);
    }

    this.persist();
    return updated;
  }

  // Tasks
  getTasks(userId: string = DEFAULT_USER.id, filter?: {
    status?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
    priority?: string;
    search?: string;
  }): Task[] {
    let tasks = this.data.tasks.filter(t => t.userId === userId);

    if (filter) {
      if (filter.status && filter.status !== 'all') {
        tasks = tasks.filter(t => t.status === filter.status);
      }
      if (filter.date) {
        tasks = tasks.filter(t => t.date === filter.date);
      }
      if (filter.startDate) {
        tasks = tasks.filter(t => t.date >= filter.startDate!);
      }
      if (filter.endDate) {
        tasks = tasks.filter(t => t.date <= filter.endDate!);
      }
      if (filter.category && filter.category !== 'all') {
        tasks = tasks.filter(t => t.category.toLowerCase() === filter.category!.toLowerCase());
      }
      if (filter.priority && filter.priority !== 'all') {
        tasks = tasks.filter(t => t.priority === filter.priority);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        tasks = tasks.filter(t => 
          t.title.toLowerCase().includes(q) || 
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q)
        );
      }
    }

    // Sort chronologically by date and startTime
    return tasks.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
      if (a.startTime) return -1;
      if (b.startTime) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }

  getTaskById(id: string, userId: string = DEFAULT_USER.id): Task | undefined {
    return this.data.tasks.find(t => t.id === id && t.userId === userId);
  }

  createTask(userId: string, taskInput: Partial<Task> & { title: string }): Task {
    const newTask: Task = {
      id: `tsk_${crypto.randomUUID().slice(0, 8)}`,
      userId,
      title: taskInput.title.trim(),
      description: taskInput.description || '',
      date: taskInput.date || getTodayString(0),
      startTime: taskInput.startTime || '',
      endTime: taskInput.endTime || '',
      priority: taskInput.priority || 'medium',
      category: taskInput.category || 'Personal',
      status: taskInput.status || 'pending',
      reminderTime: taskInput.reminderTime || '15_min',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.tasks.push(newTask);
    this.persist();
    return newTask;
  }

  updateTask(id: string, userId: string, updates: Partial<Task>): Task | null {
    const index = this.data.tasks.findIndex(t => t.id === id && t.userId === userId);
    if (index === -1) return null;

    const current = this.data.tasks[index];
    const isNowCompleted = updates.status === 'completed' && current.status !== 'completed';
    const isNowUncompleted = updates.status && updates.status !== 'completed' && current.status === 'completed';

    const updatedTask: Task = {
      ...current,
      ...updates,
      completedAt: isNowCompleted ? new Date().toISOString() : isNowUncompleted ? undefined : current.completedAt,
      updatedAt: new Date().toISOString()
    };

    this.data.tasks[index] = updatedTask;
    this.persist();
    return updatedTask;
  }

  deleteTask(id: string, userId: string): boolean {
    const initialLen = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter(t => !(t.id === id && t.userId === userId));
    if (this.data.tasks.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  completeTask(id: string, userId: string): Task | null {
    return this.updateTask(id, userId, { status: 'completed' });
  }

  // Messages / Conversation
  getMessages(limit = 50): ChatMessage[] {
    return this.data.messages.slice(-limit);
  }

  addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg_${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString()
    };
    this.data.messages.push(newMsg);
    // Keep max 200 messages
    if (this.data.messages.length > 200) {
      this.data.messages = this.data.messages.slice(-200);
    }
    this.persist();
    return newMsg;
  }

  clearMessages(): void {
    const settings = this.getSettings();
    this.data.messages = [
      {
        id: 'msg_fresh',
        role: 'assistant',
        content: `Conversation history cleared. Ready for your next command, Ritik! Speak or type whenever you need help.`,
        timestamp: new Date().toISOString()
      }
    ];
    this.persist();
  }

  resetAllTasks(userId: string = DEFAULT_USER.id): Task[] {
    this.data.tasks = getDefaultTasks(userId);
    this.persist();
    return this.data.tasks;
  }
}

export const db = new Database();

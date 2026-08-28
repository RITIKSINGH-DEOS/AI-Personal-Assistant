export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'completed' | 'cancelled';
export type TaskCategory = 'Work' | 'Study' | 'Personal' | 'Content' | 'Development' | 'Fitness' | 'Other' | string;
export type ReminderType = 'none' | 'at_time' | '5_min' | '15_min' | '30_min' | '1_hour' | 'custom';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm (24h) or "10:00 AM"
  endTime?: string; // HH:mm (24h)
  priority: Priority;
  category: TaskCategory;
  status: TaskStatus;
  reminderTime?: ReminderType | string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssistantSettings {
  id: string;
  userId: string;
  assistantName: string; // Default: 'Nova'
  wakeWord: string; // Default: 'Nova'
  voice: string; // e.g., 'Google UK English Female', 'hi-IN', 'en-US'
  speechSpeed: number; // 0.5 to 2.0 (default 1.0)
  volume: number; // 0 to 100 (default 90)
  language: string; // 'en-IN' | 'hi-IN' | 'en-US' | 'auto'
  timezone: string; // e.g., 'Asia/Kolkata', 'UTC'
  notificationsEnabled: boolean;
  voiceResponsesEnabled: boolean;
  desktopNotificationsEnabled: boolean;
  defaultReminder: ReminderType;
  wakeWordSensitivity: number; // 0.1 to 1.0 (default 0.7)
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'paused';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  toolCall?: {
    name: string;
    args: Record<string, any>;
    result?: Record<string, any>;
  };
  audioBase64?: string;
}

export interface DesktopCompanionStatus {
  isConnected: boolean;
  version: string;
  platform: 'electron' | 'python' | 'web-bridge';
  lastHeartbeat: string;
  isListening: boolean;
  activeWakeWord: string;
  notificationsCount: number;
}

export interface ReminderNotification {
  id: string;
  taskId: string;
  title: string;
  date: string;
  time: string;
  reminderLabel: string;
  timestamp: number;
  read: boolean;
}

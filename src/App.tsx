import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from './services/api';
import { VoiceService } from './services/voice';
import {
  Task,
  AssistantSettings,
  UserProfile,
  ChatMessage,
  VoiceState
} from './types';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { CalendarView } from './components/CalendarView';
import { AIAssistantView } from './components/AIAssistantView';
import { CompanionHubView } from './components/CompanionHubView';
import { SettingsView } from './components/SettingsView';
import { TaskModal } from './components/TaskModal';
import { RescheduleModal } from './components/RescheduleModal';
import { ReminderToast } from './components/ReminderToast';

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

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [settings, setSettings] = useState<AssistantSettings>(DEFAULT_SETTINGS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Voice State
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [isInterim, setIsInterim] = useState(false);
  const [isContinuousWakeActive, setIsContinuousWakeActive] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Modals & Popups
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [reschedulingTask, setReschedulingTask] = useState<Task | null>(null);
  const [activeReminder, setActiveReminder] = useState<Task | null>(null);

  // Companion
  const [companionConnected, setCompanionConnected] = useState(true);

  const voiceServiceRef = useRef<VoiceService | null>(null);

  // 1. Initial Load from Backend API
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [u, s, t, m] = await Promise.all([
        api.getCurrentUser().catch(() => DEFAULT_USER),
        api.getSettings().catch(() => DEFAULT_SETTINGS),
        api.getTasks().catch(() => []),
        api.getConversations().catch(() => [])
      ]);
      setUser(u);
      setSettings(s);
      setTasks(t);
      setMessages(m);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 2. Initialize Voice Service
  useEffect(() => {
    const vs = new VoiceService({
      wakeWord: settings.wakeWord,
      assistantName: settings.assistantName,
      language: settings.language,
      speechSpeed: settings.speechSpeed,
      volume: settings.volume,
      voiceName: settings.voice,
      onWakeWordDetected: () => {
        setVoiceState('listening');
        setTranscript(`Wake word "${settings.wakeWord}" detected! Listening...`);
        setIsInterim(false);
      },
      onTranscript: (text, isFinal) => {
        setTranscript(text);
        setIsInterim(!isFinal);
        if (isFinal) {
          handleVoiceCommandComplete(text);
        }
      },
      onSpeechStart: () => {
        setVoiceState('speaking');
      },
      onSpeechEnd: () => {
        setVoiceState('idle');
      },
      onError: (err) => {
        console.warn('Voice error:', err);
        setVoiceState('idle');
      }
    });

    voiceServiceRef.current = vs;
    setAvailableVoices(vs.getAvailableVoices());

    return () => {
      vs.stopListening();
      vs.cancelSpeech();
    };
  }, [settings.wakeWord, settings.assistantName, settings.language, settings.speechSpeed, settings.volume, settings.voice]);

  // 3. Periodic Task Reminder Checker
  useEffect(() => {
    if (!settings.notificationsEnabled) return;

    const checkReminders = () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMin = currentHours * 60 + currentMinutes;

      const todayPendingTasks = tasks.filter(t => t.date === todayStr && t.status === 'pending' && t.startTime);

      for (const t of todayPendingTasks) {
        if (!t.startTime) continue;
        const [h, m] = t.startTime.split(':').map(Number);
        const taskTotalMin = h * 60 + m;
        const diffMin = taskTotalMin - currentTotalMin;

        // Trigger if within 15 mins
        if (diffMin >= 0 && diffMin <= 15) {
          setActiveReminder(t);
          if (voiceServiceRef.current) {
            voiceServiceRef.current.playChime('reminder');
          }
          break;
        }
      }
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [tasks, settings.notificationsEnabled]);

  // Handle voice command after final transcript
  const handleVoiceCommandComplete = async (command: string) => {
    if (!command.trim()) return;

    setVoiceState('processing');
    try {
      const response = await api.sendMessage(command);
      // Update messages
      setMessages((prev) => [...prev, response.userMessage, response.assistantMessage]);

      // Refresh tasks in case tool calls modified tasks
      const updatedTasks = await api.getTasks();
      setTasks(updatedTasks);

      // Speak response aloud if enabled
      if (settings.voiceResponsesEnabled && voiceServiceRef.current) {
        setVoiceState('speaking');
        await voiceServiceRef.current.speak(response.assistantMessage.content);
      } else {
        setVoiceState('idle');
      }
    } catch (err) {
      console.error('Error processing voice command:', err);
      setVoiceState('error');
      setTimeout(() => setVoiceState('idle'), 2000);
    } finally {
      setTranscript('');
      setIsInterim(false);
    }
  };

  // User Actions
  const handleVoiceTrigger = () => {
    if (!voiceServiceRef.current) return;

    if (voiceState === 'listening') {
      voiceServiceRef.current.stopListening();
      setVoiceState('idle');
      setTranscript('');
    } else {
      setVoiceState('listening');
      setTranscript('');
      voiceServiceRef.current.startListening();
    }
  };

  const handleSendMessage = async (text: string) => {
    setVoiceState('processing');
    try {
      const response = await api.sendMessage(text);
      setMessages((prev) => [...prev, response.userMessage, response.assistantMessage]);
      const updatedTasks = await api.getTasks();
      setTasks(updatedTasks);

      if (settings.voiceResponsesEnabled && voiceServiceRef.current) {
        setVoiceState('speaking');
        await voiceServiceRef.current.speak(response.assistantMessage.content);
      } else {
        setVoiceState('idle');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setVoiceState('idle');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const updated = await api.completeTask(taskId);
      setTasks((prev) => prev.map(t => t.id === taskId ? updated : t));
      if (voiceServiceRef.current) {
        voiceServiceRef.current.playChime('success');
      }
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleSaveTask = async (taskData: Partial<Task> & { title: string }) => {
    if (editingTask) {
      const updated = await api.updateTask(editingTask.id, taskData);
      setTasks((prev) => prev.map(t => t.id === editingTask.id ? updated : t));
    } else {
      const created = await api.createTask(taskData);
      setTasks((prev) => [...prev, created]);
    }
    setEditingTask(null);
  };

  const handleRescheduleTask = async (taskId: string, newDate: string, newTime?: string) => {
    const updated = await api.rescheduleTask(taskId, newDate, newTime);
    setTasks((prev) => prev.map(t => t.id === taskId ? updated : t));
    setReschedulingTask(null);
  };

  const handleResetTasks = async () => {
    const reset = await api.resetTasks();
    setTasks(reset);
  };

  const handleClearHistory = async () => {
    await api.clearConversations();
    setMessages([]);
  };

  const handleUpdateSettings = async (updates: Partial<AssistantSettings>) => {
    const updated = await api.updateSettings(updates);
    setSettings(updated);
    if (voiceServiceRef.current) {
      voiceServiceRef.current.updateOptions({
        wakeWord: updated.wakeWord,
        assistantName: updated.assistantName,
        language: updated.language,
        speechSpeed: updated.speechSpeed,
        volume: updated.volume,
        voiceName: updated.voice
      });
    }
  };

  const handleTestVoice = (text: string) => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.speak(text);
    }
  };

  const handleToggleCompanionListening = () => {
    const nextState = !isContinuousWakeActive;
    setIsContinuousWakeActive(nextState);
    if (voiceServiceRef.current) {
      voiceServiceRef.current.toggleContinuousWake(nextState);
    }
  };

  const handleSimulateNotification = (title: string, message: string) => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.playChime('reminder');
    }
    setActiveReminder({
      id: 'sim_1',
      userId: user.id,
      title,
      description: message,
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      priority: 'high',
      category: 'Study',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <div id="nova-app-root" className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-row antialiased font-sans">
      {/* 1. Main Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        pendingTasksCount={pendingTasksCount}
        companionConnected={companionConnected}
        onVoiceTrigger={handleVoiceTrigger}
        isListening={voiceState === 'listening'}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Sticky Header */}
        <Header
          user={user}
          settings={settings}
          voiceState={voiceState}
          onVoiceTrigger={handleVoiceTrigger}
          onOpenNewTask={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onResetTasks={handleResetTasks}
          voiceResponsesEnabled={settings.voiceResponsesEnabled}
          onToggleVoiceResponse={() => {
            handleUpdateSettings({ voiceResponsesEnabled: !settings.voiceResponsesEnabled });
          }}
        />

        {/* Dynamic View Outlet */}
        <main className="flex-1 p-6 md:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              user={user}
              settings={settings}
              tasks={tasks}
              voiceState={voiceState}
              onVoiceTrigger={handleVoiceTrigger}
              onCompleteTask={handleCompleteTask}
              onOpenReschedule={(t) => setReschedulingTask(t)}
              onOpenEditTask={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onOpenNewTask={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              onSamplePromptClick={(prompt) => {
                setActiveTab('assistant');
                handleSendMessage(prompt);
              }}
              transcript={transcript}
              isInterim={isInterim}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              onCompleteTask={handleCompleteTask}
              onDeleteTask={handleDeleteTask}
              onOpenEditTask={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onOpenReschedule={(t) => setReschedulingTask(t)}
              onOpenNewTask={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              onCompleteTask={handleCompleteTask}
              onOpenEditTask={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onOpenNewTask={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {activeTab === 'assistant' && (
            <AIAssistantView
              user={user}
              settings={settings}
              messages={messages}
              voiceState={voiceState}
              onSendMessage={handleSendMessage}
              onVoiceTrigger={handleVoiceTrigger}
              onClearHistory={handleClearHistory}
              onSpeakText={handleTestVoice}
              transcript={transcript}
              isInterim={isInterim}
            />
          )}

          {activeTab === 'completed' && (
            <TasksView
              tasks={tasks.filter(t => t.status === 'completed')}
              onCompleteTask={handleCompleteTask}
              onDeleteTask={handleDeleteTask}
              onOpenEditTask={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onOpenReschedule={(t) => setReschedulingTask(t)}
              onOpenNewTask={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {activeTab === 'companion' && (
            <CompanionHubView
              settings={settings}
              companionConnected={companionConnected}
              onSimulateNotification={handleSimulateNotification}
              onToggleCompanionListening={handleToggleCompanionListening}
              isCompanionListening={isContinuousWakeActive}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearHistory={handleClearHistory}
              onResetTasks={handleResetTasks}
              onTestVoice={handleTestVoice}
              availableVoices={availableVoices}
            />
          )}
        </main>
      </div>

      {/* 3. Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />

      {/* 4. Reschedule Modal */}
      <RescheduleModal
        isOpen={Boolean(reschedulingTask)}
        task={reschedulingTask}
        onClose={() => setReschedulingTask(null)}
        onReschedule={handleRescheduleTask}
      />

      {/* 5. Live Reminder Alert Toast */}
      <ReminderToast
        task={activeReminder}
        onDismiss={() => setActiveReminder(null)}
        onComplete={(id) => {
          handleCompleteTask(id);
          setActiveReminder(null);
        }}
      />
    </div>
  );
}

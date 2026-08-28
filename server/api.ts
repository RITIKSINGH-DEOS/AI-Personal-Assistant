import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { processUserMessage } from './ai.js';
import { Task, AssistantSettings, UserProfile } from '../src/types.js';

export const apiRouter = Router();

const DEFAULT_USER_ID = 'usr_ritik_default';

// Telemetry state for desktop companion
let desktopCompanionState = {
  isConnected: false,
  lastHeartbeat: new Date().toISOString(),
  platform: 'electron' as 'electron' | 'python' | 'web-bridge',
  isListening: false,
  activeWakeWord: 'Nova',
  notificationsCount: 0
};

// 1. Current user
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = db.getUser(DEFAULT_USER_ID);
  res.json({ success: true, user });
});

// 2. Settings (Assistant Name, Wake Word, Voice, etc.)
apiRouter.get('/settings', (req: Request, res: Response) => {
  const settings = db.getSettings(DEFAULT_USER_ID);
  res.json({ success: true, settings });
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  const updates = req.body as Partial<AssistantSettings>;
  const updated = db.updateSettings(DEFAULT_USER_ID, updates);
  
  // Also synchronize companion active wake word
  if (updated.wakeWord) {
    desktopCompanionState.activeWakeWord = updated.wakeWord;
  }

  res.json({
    success: true,
    settings: updated,
    message: `Assistant settings updated. Wake word active: "${updated.wakeWord}".`
  });
});

// 3. Tasks CRUD & Queries
apiRouter.get('/tasks', (req: Request, res: Response) => {
  const { status, date, startDate, endDate, category, priority, search } = req.query;
  const tasks = db.getTasks(DEFAULT_USER_ID, {
    status: status as string,
    date: date as string,
    startDate: startDate as string,
    endDate: endDate as string,
    category: category as string,
    priority: priority as string,
    search: search as string
  });
  res.json({ success: true, count: tasks.length, tasks });
});

apiRouter.get('/tasks/today', (req: Request, res: Response) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const tasks = db.getTasks(DEFAULT_USER_ID, { date: todayStr });
  const pending = tasks.filter(t => t.status === 'pending');
  const completed = tasks.filter(t => t.status === 'completed');
  
  // Find next upcoming pending task today
  const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const nextTask = pending.find(t => t.startTime && t.startTime >= nowTime) || pending[0] || null;

  res.json({
    success: true,
    date: todayStr,
    total: tasks.length,
    pendingCount: pending.length,
    completedCount: completed.length,
    nextTask,
    tasks
  });
});

apiRouter.get('/tasks/tomorrow', (req: Request, res: Response) => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const tomorrowStr = d.toISOString().split('T')[0];
  const tasks = db.getTasks(DEFAULT_USER_ID, { date: tomorrowStr });
  res.json({
    success: true,
    date: tomorrowStr,
    total: tasks.length,
    tasks
  });
});

apiRouter.get('/tasks/upcoming', (req: Request, res: Response) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const d = new Date();
  d.setDate(d.getDate() + 7);
  const endStr = d.toISOString().split('T')[0];

  const tasks = db.getTasks(DEFAULT_USER_ID, { startDate: todayStr, endDate: endStr });
  res.json({
    success: true,
    range: `${todayStr} to ${endStr}`,
    count: tasks.length,
    tasks
  });
});

apiRouter.post('/tasks', (req: Request, res: Response) => {
  const { title, description, date, startTime, endTime, priority, category, reminderTime } = req.body;
  if (!title || !title.trim()) {
    res.status(400).json({ success: false, error: 'Task title is required.' });
    return;
  }

  const task = db.createTask(DEFAULT_USER_ID, {
    title,
    description,
    date,
    startTime,
    endTime,
    priority,
    category,
    reminderTime
  });

  res.status(201).json({ success: true, task, message: `Task "${task.title}" created successfully.` });
});

apiRouter.put('/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body as Partial<Task>;
  const updated = db.updateTask(id, DEFAULT_USER_ID, updates);

  if (!updated) {
    res.status(404).json({ success: false, error: 'Task not found.' });
    return;
  }

  res.json({ success: true, task: updated, message: `Task "${updated.title}" updated.` });
});

apiRouter.post('/tasks/:id/complete', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = db.completeTask(id, DEFAULT_USER_ID);

  if (!updated) {
    res.status(404).json({ success: false, error: 'Task not found.' });
    return;
  }

  res.json({ success: true, task: updated, message: `Task "${updated.title}" marked completed.` });
});

apiRouter.post('/tasks/:id/reschedule', (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, startTime } = req.body;
  const updated = db.updateTask(id, DEFAULT_USER_ID, { date, startTime });

  if (!updated) {
    res.status(404).json({ success: false, error: 'Task not found.' });
    return;
  }

  res.json({ success: true, task: updated, message: `Task "${updated.title}" rescheduled to ${date}${startTime ? ` at ${startTime}` : ''}.` });
});

apiRouter.delete('/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteTask(id, DEFAULT_USER_ID);

  if (!deleted) {
    res.status(404).json({ success: false, error: 'Task not found.' });
    return;
  }

  res.json({ success: true, message: 'Task deleted successfully.' });
});

apiRouter.post('/tasks/reset', (req: Request, res: Response) => {
  const tasks = db.resetAllTasks(DEFAULT_USER_ID);
  res.json({ success: true, count: tasks.length, tasks, message: 'Reset tasks to default template.' });
});

// 4. Conversation / AI Assistant Chat
apiRouter.get('/conversations', (req: Request, res: Response) => {
  const messages = db.getMessages(50);
  res.json({ success: true, messages });
});

apiRouter.post('/conversations/message', async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    res.status(400).json({ success: false, error: 'Message text is required.' });
    return;
  }

  // 1. Record user message
  const userMsg = db.addMessage({
    role: 'user',
    content: message.trim()
  });

  // 2. Fetch recent conversation history
  const history = db.getMessages(10).map(m => ({
    role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
    content: m.content
  }));

  // 3. Process with AI agent and tools
  const aiResult = await processUserMessage(message.trim(), DEFAULT_USER_ID, history);

  // 4. Record assistant response
  const assistantMsg = db.addMessage({
    role: 'assistant',
    content: aiResult.content,
    toolCall: aiResult.toolCalls.length > 0 ? aiResult.toolCalls[0] : undefined
  });

  res.json({
    success: true,
    userMessage: userMsg,
    assistantMessage: assistantMsg,
    toolCalls: aiResult.toolCalls
  });
});

apiRouter.delete('/conversations', (req: Request, res: Response) => {
  db.clearMessages();
  res.json({ success: true, message: 'Conversation history cleared.' });
});

// 5. Desktop Companion Sync & Telemetry
apiRouter.get('/companion/status', (req: Request, res: Response) => {
  const settings = db.getSettings(DEFAULT_USER_ID);
  res.json({
    success: true,
    companion: {
      ...desktopCompanionState,
      activeWakeWord: settings.wakeWord,
      assistantName: settings.assistantName
    }
  });
});

apiRouter.post('/companion/heartbeat', (req: Request, res: Response) => {
  const { platform, isListening, activeWakeWord } = req.body;
  desktopCompanionState = {
    isConnected: true,
    lastHeartbeat: new Date().toISOString(),
    platform: platform || 'python',
    isListening: Boolean(isListening),
    activeWakeWord: activeWakeWord || db.getSettings(DEFAULT_USER_ID).wakeWord,
    notificationsCount: desktopCompanionState.notificationsCount
  };
  res.json({ success: true, companion: desktopCompanionState });
});

apiRouter.get('/companion/config', (req: Request, res: Response) => {
  const settings = db.getSettings(DEFAULT_USER_ID);
  const user = db.getUser(DEFAULT_USER_ID);
  res.json({
    success: true,
    config: {
      userId: user.id,
      userName: user.name,
      assistantName: settings.assistantName,
      wakeWord: settings.wakeWord,
      voice: settings.voice,
      speechSpeed: settings.speechSpeed,
      language: settings.language,
      apiUrl: process.env.APP_URL || 'http://localhost:3000',
      sensitivity: settings.wakeWordSensitivity
    }
  });
});

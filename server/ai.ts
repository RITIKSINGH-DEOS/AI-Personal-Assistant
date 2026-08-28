import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { db } from './db.js';
import { Task, AssistantSettings, UserProfile } from '../src/types.js';

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

// Helper to format date offset strings
function getDateString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Tool declarations for Gemini
const createTaskDeclaration: FunctionDeclaration = {
  name: 'createTask',
  description: 'Creates a new scheduled task or reminder in the user\'s database. Use when the user requests adding, scheduling, or remembering a task.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'Clean, descriptive title of the task (e.g., "DSA Practice", "Website Development", "Edit YouTube Video")'
      },
      date: {
        type: Type.STRING,
        description: 'Date formatted as YYYY-MM-DD. Convert relative terms like "today", "kal" (tomorrow), "day after tomorrow", "Saturday", "next Monday" to the exact ISO date.'
      },
      startTime: {
        type: Type.STRING,
        description: 'Start time in 24-hour HH:mm format (e.g. "10:00", "15:30", "18:00")'
      },
      endTime: {
        type: Type.STRING,
        description: 'Optional end time in 24-hour HH:mm format'
      },
      priority: {
        type: Type.STRING,
        enum: ['low', 'medium', 'high', 'urgent'],
        description: 'Priority level of the task. Default to medium if unspecified.'
      },
      category: {
        type: Type.STRING,
        enum: ['Work', 'Study', 'Personal', 'Content', 'Development', 'Fitness', 'Other'],
        description: 'Category for the task'
      },
      description: {
        type: Type.STRING,
        description: 'Optional additional details or notes for the task'
      },
      reminderTime: {
        type: Type.STRING,
        enum: ['none', 'at_time', '5_min', '15_min', '30_min', '1_hour'],
        description: 'Reminder notice before the scheduled task time. Default is 15_min.'
      }
    },
    required: ['title', 'date']
  }
};

const getTodayTasksDeclaration: FunctionDeclaration = {
  name: 'getTodayTasks',
  description: 'Retrieves all tasks scheduled for today, including completed and pending counts. Use for queries like "aaj ke tasks batao", "what are today\'s tasks", "aaj kitne tasks hain".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      onlyPending: {
        type: Type.BOOLEAN,
        description: 'If true, returns only incomplete/pending tasks for today.'
      }
    }
  }
};

const getTomorrowTasksDeclaration: FunctionDeclaration = {
  name: 'getTomorrowTasks',
  description: 'Retrieves all tasks scheduled for tomorrow. Use for queries like "kal ke tasks", "what is tomorrow\'s schedule".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      onlyPending: {
        type: Type.BOOLEAN,
        description: 'If true, returns only incomplete/pending tasks for tomorrow.'
      }
    }
  }
};

const getUpcomingTasksDeclaration: FunctionDeclaration = {
  name: 'getUpcomingTasks',
  description: 'Retrieves upcoming tasks for the next N days or the weekend/next week.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      days: {
        type: Type.INTEGER,
        description: 'Number of upcoming days to inspect (default: 7)'
      }
    }
  }
};

const searchTasksDeclaration: FunctionDeclaration = {
  name: 'searchTasks',
  description: 'Searches existing tasks by keywords, title, or category.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search query (e.g. "DSA", "website", "gym", "video")'
      }
    },
    required: ['query']
  }
};

const completeTaskDeclaration: FunctionDeclaration = {
  name: 'completeTask',
  description: 'Marks an existing task as completed in the database. Use when the user says "DSA complete ho gaya", "finish website task", etc.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      taskId: {
        type: Type.STRING,
        description: 'The exact ID of the task if known'
      },
      titleQuery: {
        type: Type.STRING,
        description: 'The task title or keyword to match if exact ID is unknown (e.g., "DSA", "website", "gym")'
      }
    }
  }
};

const updateTaskDeclaration: FunctionDeclaration = {
  name: 'updateTask',
  description: 'Updates or reschedules an existing task (change date, time, priority, or title).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      taskId: {
        type: Type.STRING,
        description: 'Exact task ID if known'
      },
      titleQuery: {
        type: Type.STRING,
        description: 'The title or keyword to find the task'
      },
      newDate: {
        type: Type.STRING,
        description: 'New date in YYYY-MM-DD format'
      },
      newStartTime: {
        type: Type.STRING,
        description: 'New start time in 24-hour HH:mm format'
      },
      newTitle: {
        type: Type.STRING,
        description: 'New updated title if requested'
      },
      newPriority: {
        type: Type.STRING,
        enum: ['low', 'medium', 'high', 'urgent']
      }
    }
  }
};

const deleteTaskDeclaration: FunctionDeclaration = {
  name: 'deleteTask',
  description: 'Deletes or removes a specific task from the database.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      taskId: {
        type: Type.STRING,
        description: 'Exact task ID if known'
      },
      titleQuery: {
        type: Type.STRING,
        description: 'Title or keyword of the task to remove'
      }
    }
  }
};

// Tool execution implementation
export async function executeToolCall(name: string, args: Record<string, any>, userId: string) {
  const todayStr = getDateString(0);
  const tomorrowStr = getDateString(1);

  switch (name) {
    case 'createTask': {
      const task = db.createTask(userId, {
        title: args.title,
        date: args.date || todayStr,
        startTime: args.startTime || '',
        endTime: args.endTime || '',
        priority: args.priority || 'medium',
        category: args.category || 'Work',
        description: args.description || '',
        reminderTime: args.reminderTime || '15_min',
        status: 'pending'
      });
      return { success: true, task, message: `Task "${task.title}" scheduled for ${task.date}${task.startTime ? ` at ${task.startTime}` : ''}.` };
    }

    case 'getTodayTasks': {
      const tasks = db.getTasks(userId, {
        date: todayStr,
        status: args.onlyPending ? 'pending' : undefined
      });
      const pendingCount = tasks.filter(t => t.status === 'pending').length;
      const completedCount = tasks.filter(t => t.status === 'completed').length;
      return {
        date: todayStr,
        total: tasks.length,
        pendingCount,
        completedCount,
        tasks: tasks.map(t => ({ id: t.id, title: t.title, time: t.startTime, status: t.status, priority: t.priority, category: t.category }))
      };
    }

    case 'getTomorrowTasks': {
      const tasks = db.getTasks(userId, {
        date: tomorrowStr,
        status: args.onlyPending ? 'pending' : undefined
      });
      return {
        date: tomorrowStr,
        total: tasks.length,
        tasks: tasks.map(t => ({ id: t.id, title: t.title, time: t.startTime, status: t.status, priority: t.priority, category: t.category }))
      };
    }

    case 'getUpcomingTasks': {
      const days = args.days || 7;
      const start = todayStr;
      const end = getDateString(days);
      const tasks = db.getTasks(userId, { startDate: start, endDate: end });
      return {
        range: `${start} to ${end}`,
        total: tasks.length,
        tasks: tasks.map(t => ({ id: t.id, title: t.title, date: t.date, time: t.startTime, status: t.status, priority: t.priority }))
      };
    }

    case 'searchTasks': {
      const tasks = db.getTasks(userId, { search: args.query });
      return {
        query: args.query,
        count: tasks.length,
        tasks: tasks.map(t => ({ id: t.id, title: t.title, date: t.date, time: t.startTime, status: t.status }))
      };
    }

    case 'completeTask': {
      let target: Task | undefined;
      if (args.taskId) {
        target = db.getTaskById(args.taskId, userId);
      } else if (args.titleQuery) {
        const matches = db.getTasks(userId, { search: args.titleQuery });
        target = matches.find(t => t.status === 'pending') || matches[0];
      }

      if (!target) {
        return { success: false, message: `Could not find a task matching "${args.titleQuery || args.taskId}".` };
      }

      const completed = db.completeTask(target.id, userId);
      return { success: true, task: completed, message: `Marked "${target.title}" as completed.` };
    }

    case 'updateTask': {
      let target: Task | undefined;
      if (args.taskId) {
        target = db.getTaskById(args.taskId, userId);
      } else if (args.titleQuery) {
        const matches = db.getTasks(userId, { search: args.titleQuery });
        target = matches[0];
      }

      if (!target) {
        return { success: false, message: `Could not find a task matching "${args.titleQuery || args.taskId}".` };
      }

      const updates: Partial<Task> = {};
      if (args.newDate) updates.date = args.newDate;
      if (args.newStartTime !== undefined) updates.startTime = args.newStartTime;
      if (args.newTitle) updates.title = args.newTitle;
      if (args.newPriority) updates.priority = args.newPriority;

      const updated = db.updateTask(target.id, userId, updates);
      return { success: true, task: updated, message: `Updated "${target.title}".` };
    }

    case 'deleteTask': {
      let target: Task | undefined;
      if (args.taskId) {
        target = db.getTaskById(args.taskId, userId);
      } else if (args.titleQuery) {
        const matches = db.getTasks(userId, { search: args.titleQuery });
        target = matches[0];
      }

      if (!target) {
        return { success: false, message: `Could not find a task matching "${args.titleQuery || args.taskId}".` };
      }

      const ok = db.deleteTask(target.id, userId);
      return { success: ok, taskTitle: target.title, message: `Deleted task "${target.title}".` };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// Fallback rule-based natural language parser for Hinglish/English if API key is not present
function fallbackProcessMessage(text: string, userId: string, settings: AssistantSettings): { content: string; toolCall?: any } {
  const lower = text.toLowerCase();
  const todayStr = getDateString(0);
  const tomorrowStr = getDateString(1);

  // Check today's tasks
  if (lower.includes('aaj') || lower.includes('today') || lower.includes('ab ke task') || lower.includes('pending task')) {
    const tasks = db.getTasks(userId, { date: todayStr });
    const pending = tasks.filter(t => t.status === 'pending');
    const completed = tasks.filter(t => t.status === 'completed');

    if (tasks.length === 0) {
      return { content: `Aaj aapka koi task scheduled nahi hai. Enjoy your day or add a new task!` };
    }

    let summary = `Aaj tumhare total ${tasks.length} tasks hain (${completed.length} complete, ${pending.length} pending):\n`;
    tasks.forEach(t => {
      summary += `• ${t.startTime ? `${t.startTime} — ` : ''}${t.title} [${t.status === 'completed' ? '✓ Complete' : 'Pending'}]\n`;
    });
    return {
      content: summary.trim(),
      toolCall: { name: 'getTodayTasks', args: {}, result: { total: tasks.length, pending: pending.length, completed: completed.length } }
    };
  }

  // Check tomorrow's tasks
  if (lower.includes('kal') || lower.includes('tomorrow')) {
    if (lower.includes('add') || lower.includes('padhna') || lower.includes('karna') || lower.includes('shift') || lower.includes('baje') || lower.includes('pm') || lower.includes('am')) {
      // It's a task creation or modification
      // Check time
      let time = '';
      const timeMatch = lower.match(/(\d{1,2})\s*(baje|pm|am|:00)?/);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1], 10);
        if (lower.includes('shaam') || lower.includes('pm') || (hour < 8 && !lower.includes('subah') && !lower.includes('am'))) {
          if (hour < 12) hour += 12;
        }
        time = `${hour.toString().padStart(2, '0')}:00`;
      }

      let title = 'New Scheduled Task';
      if (lower.includes('dsa')) title = 'DSA Practice';
      else if (lower.includes('website')) title = 'Website Development';
      else if (lower.includes('youtube') || lower.includes('video')) title = 'Edit YouTube Video';
      else if (lower.includes('gym')) title = 'Gym Workout';
      else if (lower.includes('meeting') || lower.includes('sync')) title = 'Meeting';
      else {
        title = text.replace(/kal|subah|shaam|baje|padhna|hai|karna|task|add|kar|do|nova|jarvis/gi, '').trim() || 'Scheduled Task';
      }

      const task = db.createTask(userId, {
        title,
        date: tomorrowStr,
        startTime: time || '10:00',
        priority: 'high',
        category: title.includes('DSA') ? 'Study' : title.includes('Website') ? 'Development' : 'Work',
        status: 'pending'
      });

      return {
        content: `Done! Maine kal ke liye "${task.title}" ${task.startTime ? `${task.startTime} baje` : ''} schedule kar diya hai.`,
        toolCall: { name: 'createTask', args: { title: task.title, date: tomorrowStr, startTime: task.startTime }, result: task }
      };
    }

    const tasks = db.getTasks(userId, { date: tomorrowStr });
    if (tasks.length === 0) {
      return { content: `Kal ke liye abhi koi task scheduled nahi hai.` };
    }
    let summary = `Kal tumhare ${tasks.length} tasks scheduled hain:\n`;
    tasks.forEach(t => {
      summary += `• ${t.startTime ? `${t.startTime} — ` : ''}${t.title}\n`;
    });
    return {
      content: summary.trim(),
      toolCall: { name: 'getTomorrowTasks', args: {}, result: { total: tasks.length } }
    };
  }

  // Complete task
  if (lower.includes('complete') || lower.includes('khatam') || lower.includes('ho gaya')) {
    let query = '';
    if (lower.includes('dsa')) query = 'DSA';
    else if (lower.includes('website')) query = 'Website';
    else if (lower.includes('video') || lower.includes('youtube')) query = 'YouTube';
    else query = text.replace(/complete|kar|do|wala|task|khatam|ho|gaya|nova/gi, '').trim();

    const matches = db.getTasks(userId, { search: query });
    const target = matches.find(t => t.status === 'pending') || matches[0];
    if (target) {
      const completed = db.completeTask(target.id, userId);
      return {
        content: `Done! Task "${target.title}" complete mark ho gaya hai.`,
        toolCall: { name: 'completeTask', args: { taskId: target.id, titleQuery: query }, result: completed }
      };
    }
  }

  // Delete task
  if (lower.includes('delete') || lower.includes('hata do') || lower.includes('remove')) {
    let query = '';
    if (lower.includes('gym')) query = 'Gym';
    else if (lower.includes('dsa')) query = 'DSA';
    else if (lower.includes('website')) query = 'Website';
    else query = text.replace(/delete|hata|do|remove|wala|task|nova/gi, '').trim();

    const matches = db.getTasks(userId, { search: query });
    if (matches.length > 0) {
      const target = matches[0];
      db.deleteTask(target.id, userId);
      return {
        content: `Done. Maine "${target.title}" task remove kar diya hai.`,
        toolCall: { name: 'deleteTask', args: { taskId: target.id, titleQuery: query }, result: { success: true } }
      };
    }
  }

  return {
    content: `Main samajh gaya. Main aapke tasks aur schedule ko manage karne ke liye taiyaar hoon. Aap mujhse pooch sakte hain: "Aaj ke tasks batao", "Kal 10 baje DSA add kar do", ya "DSA wala task complete kar do".`
  };
}

export async function processUserMessage(
  userText: string,
  userId: string,
  history: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<{ content: string; toolCalls: any[] }> {
  const settings = db.getSettings(userId);
  const user = db.getUser(userId);
  const ai = getAI();

  const toolCallsExecuted: any[] = [];

  if (!ai) {
    const fallback = fallbackProcessMessage(userText, userId, settings);
    return {
      content: fallback.content,
      toolCalls: fallback.toolCall ? [fallback.toolCall] : []
    };
  }

  const todayStr = getDateString(0);
  const tomorrowStr = getDateString(1);
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';

  const systemInstruction = `You are ${settings.assistantName}, an elite personal AI voice assistant and productivity companion for ${user.name}.
Current Date: ${todayStr} (${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}).
Current Time: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}.
User Timezone: ${settings.timezone}.

Language & Persona Guidelines:
- The user may speak or type in English, Hindi, or conversational Hinglish (mixed Hindi-English sentences like "Kal subah 10 baje DSA practice add kar do", "Aaj ke saare pending tasks batao", "Website wala task complete kar do", "Jo DSA ka task hai usko Sunday shift kar do").
- Respond naturally, concisely, and supportively in the user's spoken language style (natural Hinglish or English).
- Keep voice responses crisp and conversational (ideal for text-to-speech).
- ALWAYS call the appropriate tool when the user wants to add, view, update, complete, delete, or reschedule tasks.
- If information is missing and critical, ask briefly. If the user provided enough context (e.g., "Kal 5 baje website ka kaam karna hai"), call the tool immediately without unnecessary back-and-forth.
- Maintain short-term conversational context: if the user previously talked about "Website Development" and says "Usko 5 baje kar do", refer to that task.`;

  try {
    const tools = [{
      functionDeclarations: [
        createTaskDeclaration,
        getTodayTasksDeclaration,
        getTomorrowTasksDeclaration,
        getUpcomingTasksDeclaration,
        searchTasksDeclaration,
        completeTaskDeclaration,
        updateTaskDeclaration,
        deleteTaskDeclaration
      ]
    }];

    // Convert past messages to Gemini format
    const contents: any[] = history.slice(-6).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: userText }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        tools,
        temperature: 0.3
      }
    });

    const candidate = response.candidates?.[0];
    const functionCalls = candidate?.content?.parts?.filter(p => p.functionCall)?.map(p => p.functionCall) || [];

    if (functionCalls.length > 0) {
      // Execute function calls
      const toolResponses: any[] = [];
      for (const fc of functionCalls) {
        if (fc && fc.name) {
          const result = await executeToolCall(fc.name, fc.args as Record<string, any>, userId);
          toolCallsExecuted.push({
            name: fc.name,
            args: fc.args,
            result
          });
          toolResponses.push({
            name: fc.name,
            response: { output: result }
          });
        }
      }

      // Generate final conversational summary
      const followUpContents = [
        ...contents,
        {
          role: 'model',
          parts: functionCalls.map(fc => ({ functionCall: fc }))
        },
        {
          role: 'user',
          parts: toolResponses.map(tr => ({
            functionResponse: {
              name: tr.name,
              response: tr.response
            }
          }))
        }
      ];

      const followUpRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: followUpContents,
        config: {
          systemInstruction,
          temperature: 0.3
        }
      });

      const finalReply = followUpRes.text || 'Task processed successfully.';
      return {
        content: finalReply,
        toolCalls: toolCallsExecuted
      };
    }

    return {
      content: response.text || 'Understood.',
      toolCalls: []
    };
  } catch (err: any) {
    console.error('Error generating content from Gemini API, falling back:', err);
    const fallback = fallbackProcessMessage(userText, userId, settings);
    return {
      content: fallback.content,
      toolCalls: fallback.toolCall ? [fallback.toolCall] : []
    };
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 服务器配置
export const SERVER_CONFIG = {
  // 服务器端口
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  
  // 服务器绑定地址
  HOST: '0.0.0.0',
  
  // API 路径
  API_PATHS: {
    HEALTH: '/api/health',
    AI_PARSE: '/api/ai/parse',
  },
  
  // Gemini 配置
  GEMINI: {
    MODEL: 'gemini-3.5-flash',
    TEMPERATURE_PARSE: 0.1,
  },
  
  // 默认的自定义 AI 配置
  DEFAULT_CUSTOM_AI: {
    BASE_URL: 'https://api.openai.com/v1',
    MODEL: 'gpt-3.5-turbo',
  },
};

// AI 任务解析系统提示词
export const AI_PARSE_SYSTEM_PROMPT = (tasksContext: string) => `You are an expert Task Parsing Agent in a smart Task Manager.
Your role matches the user's natural language input (which is usually in Chinese or English) and interprets it relative to the current Tasks.
You must compile the command into a structured JSON response to execute localized CRUD task modifications.

Supported Actions:
1. 'add': create a single task. Extract properties: title (string, required), description (string, optional/detailed), priority ('low' | 'medium' | 'high', default: 'medium'), dueDate ('YYYY-MM-DD', optional), tags (array of strings, optional).
2. 'update': update an existing task's properties. Identify the correct 'taskId' (number, required) from the current list. Extract fields like priority, title, description, tags, status ('pending' | 'completed').
3. 'delete': delete an task. Identify the 'taskId' (number, required).
4. 'batch': batch create multiple tasks at once. Extract into the 'tasks' array.
5. 'none': if the instruction doesn't map to a clear task action, return success: false and write a polite help message in 'message'.

Current Task List Context in App (JSON):
${tasksContext}

Important Matching Heuristics:
- If the user says "完成买牛奶" (Complete buying milk) or "完成任务 2" (Complete task 2), look for matching title "买牛奶" or id 2, set action to "update", status to "completed", and provide the correct "taskId".
- If a task ID is explicitly specified (e.g. ID 2, #2, 2号任务), prioritize it.
- If they say "删除[某任务]" (Delete [some task]), set action to "delete", find matching task ID, set "taskId".
- Return JSON strictly following the Schema. Avoid wrapping in markdown other than standard application/json.

JSON Output Schema:
{
  "success": boolean,
  "action": "add" | "update" | "delete" | "batch" | "none",
  "message": "A friendly Chinese explanation of the operation performed",
  "task": {
    "title": string,
    "description": string,
    "priority": "low" | "medium" | "high",
    "status": "pending" | "completed",
    "dueDate": "YYYY-MM-DD",
    "tags": string[]
  },
  "tasks": [
    { "title": string, "description": string, "priority": "low" | "medium" | "high", "tags": string[] }
  ],
  "taskId": number
}`;

// 错误消息配置
export const ERROR_MESSAGES = {
  GEMINI_API_KEY_MISSING: 'GEMINI_API_KEY is not defined in environment variables',
  INSTRUCTION_REQUIRED: 'Instruction is required and must be a string.',
  CUSTOM_API_KEY_REQUIRED: 'Custom API Key is required when Custom provider is selected.',
  CUSTOM_AI_ERROR: 'Custom AI Endpoint returned error',
  EMPTY_RESPONSE: 'Empty response from Gemini.',
  PARSE_JSON_FAILED: 'Failed to parse custom AI JSON',
};

// HTTP 头配置
export const HTTP_HEADERS = {
  USER_AGENT: 'smart-task-panel',
  CONTENT_TYPE: 'application/json',
};

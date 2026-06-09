/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIActionResponse, AIConfig, Task } from '../types';

const EDIT_INTENT_REGEX =
  /(修改|改成|改为|改下|更新|编辑|调整|完善|补充|重命名|rename|update|edit|设置|设为|标记|完成|改标题|改描述|改优先级|改截止|改标签|清空|删除标签|去掉标签)/i;
const MULTI_EDIT_INTENT_REGEX =
  /(除了|除开|其余|其他|全部|所有|批量|统一|都改|都设置|全部改|所有任务)/i;
const DELETE_INTENT_REGEX = /(删除|移除|删掉|去掉这个任务|remove|delete)/i;
const CREATE_INTENT_REGEX =
  /(新增|添加|创建|增加|记下|记录|安排|加入|add|create|append|todo|待办|任务[:：]?)/i;
const TITLE_SPLIT_REGEX = /\r?\n+|[；;]+|(?:、(?=\S))/g;
const SHARED_FIELD_PATTERNS = {
  dueDate:
    /(?:截止(?:日期|时间)?|到期(?:日期|时间)?|due(?:\s+date)?|在)\s*(?:是|为)?\s*((?:20\d{2}[-/.年]\d{1,2}[-/.月]\d{1,2}日?)|今天|明天|后天)/i,
  description:
    /(?:描述|说明|备注|内容)\s*(?:是|为|[:：])\s*["“]?([^"”]+?)["”]?(?=(?:[,，；;。]|(?:标签|优先级|截止|到期|状态))|$)/i,
  tags:
    /(?:标签|tag(?:s)?)\s*(?:是|为|[:：]|加上|添加)?\s*["“]?([^"”]+?)["”]?(?=(?:[；;。]|(?:优先级|截止|到期|描述|说明|备注|状态))|$)/i,
  priority:
    /(?:(高|中|低)(?:优先级)?|优先级\s*(?:是|为)?\s*(高|中|低|high|medium|low)|(?:priority)\s*(?:is|=|:)?\s*(high|medium|low))/i,
  status:
    /(标记为已完成|标记成已完成|设为已完成|状态为已完成|已完成|完成|标记为待办|设为待办|恢复进行中|未完成|pending|completed)/i,
};

const normalizeDateToken = (raw: string | undefined) => {
  if (!raw) {
    return undefined;
  }

  const token = raw.trim();
  const today = new Date();

  if (token === '今天') {
    return today.toISOString().slice(0, 10);
  }

  if (token === '明天') {
    return new Date(today.getTime() + 24 * 3600 * 1000).toISOString().slice(0, 10);
  }

  if (token === '后天') {
    return new Date(today.getTime() + 2 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  }

  const normalized = token
    .replace(/年|[/.]/g, '-')
    .replace(/月/g, '-')
    .replace(/日/g, '')
    .trim();

  const parts = normalized.split('-').filter(Boolean);
  if (parts.length !== 3) {
    return undefined;
  }

  const [year, month, day] = parts;
  return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const normalizePriority = (raw: string | undefined): Task['priority'] | undefined => {
  if (!raw) {
    return undefined;
  }

  if (/高|high/i.test(raw)) {
    return 'high';
  }

  if (/低|low/i.test(raw)) {
    return 'low';
  }

  if (/中|medium/i.test(raw)) {
    return 'medium';
  }

  return undefined;
};

const normalizeStatus = (raw: string | undefined): Task['status'] | undefined => {
  if (!raw) {
    return undefined;
  }

  if (/已完成|完成|completed/i.test(raw)) {
    return 'completed';
  }

  if (/待办|未完成|pending|进行中/i.test(raw)) {
    return 'pending';
  }

  return undefined;
};

const normalizeTags = (raw: string | undefined) => {
  if (!raw) {
    return [] as string[];
  }

  return raw
    .split(/[，,、/|]/)
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter(Boolean);
};

const cleanupTaskTitle = (raw: string) =>
  raw
    .replace(/^(新增|添加|创建|增加|记下|记录|安排|加入)(?:一个|一条|条|个)?(?:任务)?[:：]?\s*/i, '')
    .replace(/^任务[:：]\s*/i, '')
    .replace(/^(请|帮我|帮忙)\s*/i, '')
    .replace(/["“”]/g, '')
    .replace(/[。；;，,]+$/g, '')
    .trim();

const stripSharedFieldSegments = (input: string) =>
  input
    .replace(SHARED_FIELD_PATTERNS.dueDate, '')
    .replace(SHARED_FIELD_PATTERNS.description, '')
    .replace(SHARED_FIELD_PATTERNS.tags, '')
    .replace(SHARED_FIELD_PATTERNS.priority, '')
    .replace(SHARED_FIELD_PATTERNS.status, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

const extractSharedCreateFields = (instruction: string) => {
  const dueDateMatch = instruction.match(SHARED_FIELD_PATTERNS.dueDate);
  const descriptionMatch = instruction.match(SHARED_FIELD_PATTERNS.description);
  const tagsMatch = instruction.match(SHARED_FIELD_PATTERNS.tags);
  const priorityMatch = instruction.match(SHARED_FIELD_PATTERNS.priority);
  const statusMatch = instruction.match(SHARED_FIELD_PATTERNS.status);

  return {
    dueDate: normalizeDateToken(dueDateMatch?.[1]),
    description: descriptionMatch?.[1]?.trim(),
    tags: normalizeTags(tagsMatch?.[1]),
    priority: normalizePriority(priorityMatch?.[1] || priorityMatch?.[2] || priorityMatch?.[3]),
    status: normalizeStatus(statusMatch?.[1]),
  };
};

const splitCreateTitles = (instruction: string) => {
  const stripped = instruction
    .replace(/^(请|帮我|帮忙)\s*/i, '')
    .replace(/^(新增|添加|创建|增加|记下|记录|安排|加入)(?:一个|一条|条|个)?(?:任务)?[:：]?\s*/i, '')
    .trim();

  const listSource = (stripped.includes('：') ? stripped.split('：').slice(-1)[0] : stripped).trim();
  const metadataIndex = listSource.search(/[，,\s]*(?:描述|说明|备注|标签|优先级|截止|到期|状态)/i);
  const titleOnlySource = (metadataIndex >= 0 ? listSource.slice(0, metadataIndex) : listSource).trim();
  const cleanedSource = stripSharedFieldSegments(titleOnlySource);
  const candidates = cleanedSource
    .split(TITLE_SPLIT_REGEX)
    .flatMap((segment) => segment.split(/(?:^|[，,])\s*(?=(?:第?\d+[.、]|[-*•]))/))
    .map((segment) =>
      segment
        .replace(/^(?:第?\d+[.、)]|[-*•])\s*/g, '')
        .trim()
    )
    .filter(Boolean);

  if (candidates.length > 1) {
    return candidates.map(cleanupTaskTitle).filter(Boolean);
  }

  const commaSeparated = cleanedSource
    .split(/[，,]/)
    .map((segment) => cleanupTaskTitle(segment))
    .filter(Boolean);

  if (commaSeparated.length > 1 && !/(描述|说明|备注|标签|优先级|截止|到期|状态)/.test(instruction)) {
    return commaSeparated;
  }

  return [cleanupTaskTitle(cleanedSource)].filter(Boolean);
};

const buildLocalCreateAction = (instruction: string): AIActionResponse | null => {
  const fields = extractSharedCreateFields(instruction);
  const titles = splitCreateTitles(instruction);

  if (titles.length === 0) {
    return null;
  }

  const tasks = titles.map((title) => ({
    title,
    description: fields.description ?? null,
    priority: fields.priority ?? 'medium',
    status: fields.status ?? 'pending',
    dueDate: fields.dueDate ?? null,
    tags: fields.tags,
  }));

  if (tasks.length === 1) {
    return {
      success: true,
      action: 'add',
      message: `已识别为新增任务：${tasks[0].title}`,
      task: tasks[0],
    };
  }

  return {
    success: true,
    action: 'batch',
    message: `已识别为批量新增 ${tasks.length} 条任务`,
    tasks,
  };
};

const shouldUseLocalCreateParser = (instruction: string, tasks: Task[]) => {
  const trimmed = instruction.trim();
  if (!trimmed) {
    return false;
  }

  if (EDIT_INTENT_REGEX.test(trimmed) || DELETE_INTENT_REGEX.test(trimmed)) {
    return false;
  }

  if (CREATE_INTENT_REGEX.test(trimmed)) {
    return true;
  }

  return tasks.length === 0;
};

const sanitizeAIResponse = (
  parsed: AIActionResponse,
  instruction: string,
  tasks: Task[]
): AIActionResponse => {
  if (parsed.action === 'add' || parsed.action === 'batch') {
    const localCreate = buildLocalCreateAction(instruction);
    if (localCreate) {
      return localCreate;
    }
  }

  if (parsed.action === 'update' && typeof parsed.taskId !== 'number' && parsed.task?.id) {
    return {
      ...parsed,
      taskId: parsed.task.id,
    };
  }

  if (parsed.action === 'delete' && typeof parsed.taskId !== 'number') {
    const matchedTask = tasks.find((task) => parsed.task?.id === task.id);
    if (matchedTask) {
      return {
        ...parsed,
        taskId: matchedTask.id,
      };
    }
  }

  return parsed;
};

const buildTaskContext = (tasks: Task[]) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return 'No existing tasks in app.';
  }

  return tasks
    .map((task: Task) =>
      JSON.stringify({
        id: task.id,
        title: task.title,
        description: task.description ?? null,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ?? null,
        tags: Array.isArray(task.tags) ? task.tags : [],
        createdAt: task.createdAt,
      })
    )
    .join('\n');
};

const getSystemPrompt = (tasks: Task[], isEditIntent: boolean) => {
  const contextTasks = buildTaskContext(tasks);

  if (isEditIntent) {
    return `You are an expert JSON task editor.
You will receive:
1. The user's edit instruction.
2. The original task list as JSON.

Your job:
- Identify one or more existing tasks that should be modified.
- Start from the original task JSON object for each matched task.
- Apply the user's requested changes onto the original JSON.
- Return the FULL modified task JSON for every matched existing task.

Hard rules:
- Only edit an existing task from the provided originalTasksJson list.
- Never create a new task.
- Never return placeholder titles.
- Preserve untouched fields from the original JSON exactly as they were unless the user asked to change them.
- If the user asks to clear description, return "description": null.
- If the user asks to clear due date, return "dueDate": null.
- If the user asks to clear tags, return "tags": [].
- If the instruction targets multiple existing tasks, return action "update_many".
- For "update_many", return:
  - "taskIds": matched existing task IDs
  - "tasks": fully modified final task JSON objects in the same order
- If multiple tasks could match but the selection rule itself is unclear, return action "none" with success false.

Output JSON schema:
{
  "success": boolean,
  "action": "update" | "update_many" | "none",
  "message": "A friendly Chinese explanation",
  "taskId": number,
  "taskIds": number[],
  "task": {
    "id": number,
    "title": string,
    "description": string | null,
    "status": "pending" | "completed",
    "priority": "low" | "medium" | "high",
    "dueDate": "YYYY-MM-DD" | null,
    "tags": string[],
    "createdAt": string
  },
  "tasks": [
    {
      "id": number,
      "title": string,
      "description": string | null,
      "status": "pending" | "completed",
      "priority": "low" | "medium" | "high",
      "dueDate": "YYYY-MM-DD" | null,
      "tags": string[],
      "createdAt": string
    }
  ]
}

Return raw JSON only.`;
  }

  return `You are an expert Task Parsing Agent in a smart Task Manager.
Your job is to convert the user's natural language instruction into a STRICT JSON action for task CRUD.
The current task data format is JSON. The user's request is the single source of truth.
Your most important job is to correctly MODIFY existing tasks when the user asks to edit task properties.

Supported Actions:
1. "add": create one task in "task".
2. "update": modify exactly one existing task. You must identify "taskId" from the current tasks.
3. "update_many": modify multiple existing tasks. You must identify "taskIds" and return modified full tasks in "tasks".
4. "delete": delete exactly one existing task. You must identify "taskId".
5. "batch": create multiple tasks in "tasks".
6. "none": use this when the instruction is ambiguous, unsupported, or cannot be matched safely.

Current Task List Context in App:
One task per line. Treat every line as an existing JSON task object that may be updated by ID.
${contextTasks}

Critical Rules For Precision:
- Follow the user's requested modification exactly.
- For "update", only include fields in "task" that the user explicitly asked to change.
- Never rewrite untouched fields. If the user only asks to change priority, do not include title/description/tags/status/dueDate.
- Existing tasks are JSON objects with editable properties:
  - "title": string
  - "description": string | null
  - "priority": "low" | "medium" | "high"
  - "status": "pending" | "completed"
  - "dueDate": "YYYY-MM-DD" | null
  - "tags": string[]
- When the user asks to modify any of these properties on an existing task, prefer action "update".
- A single instruction may change multiple properties on the same task at once. In that case, return one "update" action with all explicitly requested changed fields inside "task".
- If the user asks to modify multiple existing tasks at once, use action "update_many".
- For "update_many", return:
  - "taskIds": the matched existing task IDs
  - "tasks": the fully modified final JSON objects for those same tasks, in the same order
- If the instruction sounds like modifying, renaming, completing, reprioritizing, retagging, clearing, or rescheduling an existing task, you should almost never return "add" or "batch".
- Never create placeholder tasks such as "智能节点" unless the user explicitly requested that exact title.
- If the user asks to clear a field, return that field as null:
  - clear description => "description": null
  - clear due date => "dueDate": null
  - clear tags => "tags": []
- If the user asks to replace tags, return the final full tag list.
- If the user asks to append tags, return the full final tag list for that task when it can be inferred from context.
- If the user asks to remove one or more tags, return the final full tag list for that task when it can be inferred from context.
- If the user asks to rename a task, use "update" and include only "title" unless other fields are also explicitly requested.
- If the user asks to modify description, due date, priority, status, or tags, update exactly those properties.
- Do not convert an edit request into "add" just because the user described new values.
- Prefer explicit task ID if the user provides one, such as "ID 2", "#2", "2号任务".
- If no explicit ID is given, match by title/semantic meaning using the provided task list.
- If multiple tasks could match and you cannot determine one safely, return action "none" with success false.
- If the user asks to mark a task complete or pending, use action "update" with only "status".
- If the user asks to change multiple properties on the same task, include only those requested properties.
- For "add" and "batch", infer missing optional fields conservatively. Do not invent unnecessary details.
- For "batch", every task must have a concrete title taken from the user's request. Never use generic fallback titles.
- Return raw JSON only. No markdown fences. No explanations outside the JSON.

Examples:
- User: "把任务2优先级改成高"
  => action "update", taskId 2, task { "priority": "high" }
- User: "完成买牛奶"
  => action "update", matched taskId, task { "status": "completed" }
- User: "把写周报的截止日期改成 2026-06-12，并加上工作标签"
  => action "update", matched taskId, task { "dueDate": "2026-06-12", "tags": ["原有标签...", "工作"] }
- User: "把任务3标题改成给客户回邮件，描述改成今天下班前发出"
  => action "update", taskId 3, task { "title": "给客户回邮件", "description": "今天下班前发出" }
- User: "清空任务 4 的截止日期和描述"
  => action "update", taskId 4, task { "dueDate": null, "description": null }
- User: "把买咖啡这个任务的标签改成 errands 和 personal"
  => action "update", matched taskId, task { "tags": ["errands", "personal"] }
- User: "对除了【adhd管理器】的任务，其他任务的标签改为【css编辑器】"
  => action "update_many", taskIds [1,2,3,4], tasks [modified full JSON objects]
- User: "删除标签为空的描述"
  => If unclear, return action "none"

JSON Output Schema:
{
  "success": boolean,
  "action": "add" | "update" | "update_many" | "delete" | "batch" | "none",
  "message": "A friendly Chinese explanation of the operation performed",
  "task": {
    "title": string,
    "description": string | null,
    "priority": "low" | "medium" | "high",
    "status": "pending" | "completed",
    "dueDate": "YYYY-MM-DD" | null,
    "tags": string[]
  },
  "tasks": [
    {
      "title": string,
      "description": string,
      "priority": "low" | "medium" | "high",
      "status": "pending" | "completed",
      "dueDate": "YYYY-MM-DD",
      "tags": string[]
    }
  ],
  "taskId": number,
  "taskIds": number[]
}`;
};

const buildUserPrompt = (instruction: string, tasks: Task[], isEditIntent: boolean) => {
  if (isEditIntent) {
    const originalTasks = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description ?? null,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ?? null,
      tags: Array.isArray(task.tags) ? task.tags : [],
      createdAt: task.createdAt,
    }));

    return `Edit Task Payload:
${JSON.stringify(
  {
    instruction,
    originalTasksJson: originalTasks,
    expectedBehavior: [
      'Find one or more existing tasks to modify.',
      'Use the original task JSON as the base object.',
      'Apply only the user requested changes.',
      'Return the fully modified task JSON for every matched existing task.',
      'Do not create new tasks.',
    ],
  },
  null,
  2
)}`;
  }

  return `User Instruction Payload:
${JSON.stringify(
  {
    userInstruction: instruction,
    intentHint: EDIT_INTENT_REGEX.test(instruction)
      ? 'likely_update_existing_task'
      : 'general',
    existingTaskCount: tasks.length,
    outputContract: {
      mustModifyExistingTaskWhenEditing: true,
      mustReturnTaskIdForUpdateOrDelete: true,
      mustNotInventPlaceholderTitles: true,
    },
  },
  null,
  2
)}`;
};

/**
 * 调用 OpenAI 兼容的 API（包括 OpenAI, DeepSeek, Ollama 等）
 */
async function callOpenAICompatibleAPI(
  instruction: string,
  tasks: Task[],
  aiConfig: AIConfig
): Promise<AIActionResponse> {
  const baseUrl = aiConfig.baseUrl || 'https://api.openai.com/v1';
  const apiKey = aiConfig.apiKey;
  const model = aiConfig.model || 'gpt-3.5-turbo';

  if (!apiKey) {
    throw new Error('请先配置 API Key');
  }

  const isEditIntent = EDIT_INTENT_REGEX.test(instruction);
  const systemPrompt = getSystemPrompt(tasks, isEditIntent);
  const userPrompt = buildUserPrompt(instruction, tasks, isEditIntent);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API 返回错误 ${response.status}: ${errorText}`);
  }

  const responseData = await response.json();
  const answerStr = responseData.choices?.[0]?.message?.content || '';

  try {
    let parsed = JSON.parse(answerStr.replace(/```json|```/g, '').trim());

    // 验证和修正
    if (isEditIntent && (parsed.action === 'add' || parsed.action === 'batch')) {
      const isMultiEdit = MULTI_EDIT_INTENT_REGEX.test(instruction);
      parsed = {
        success: false,
        action: 'none',
        message: isMultiEdit
          ? 'AI 未能正确识别为批量修改已有任务，请换一种更明确的表达。'
          : 'AI 未能正确识别为修改已有任务，请换一种更明确的表达。',
      };
    }

    return parsed;
  } catch (parseError) {
    console.error('Failed to parse AI JSON:', answerStr);
    throw new Error(`AI 返回的 JSON 格式错误: ${answerStr.slice(0, 200)}`);
  }
}

/**
 * 主入口：解析用户指令
 */
export async function parseTaskInstruction(
  instruction: string,
  tasks: Task[],
  aiConfig: AIConfig
): Promise<AIActionResponse> {
  if (!instruction || typeof instruction !== 'string') {
    throw new Error('指令不能为空');
  }

  if (shouldUseLocalCreateParser(instruction, tasks)) {
    const localCreate = buildLocalCreateAction(instruction);
    if (localCreate) {
      return localCreate;
    }
  }

  // 统一使用 OpenAI 兼容 API
  // 如果用户选择 built-in，需要先配置为指向实际的 API
  if (aiConfig.provider === 'built-in') {
    // 检查是否配置了 API
    if (!aiConfig.apiKey || !aiConfig.baseUrl) {
      throw new Error(
        '请先在配置页面设置 AI API。您可以使用 OpenAI、DeepSeek、Ollama 或其他兼容 OpenAI 格式的 API。'
      );
    }
  }

  const parsed = await callOpenAICompatibleAPI(instruction, tasks, aiConfig);
  return sanitizeAIResponse(parsed, instruction, tasks);
}

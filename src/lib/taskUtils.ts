import { APP_CONFIG, TASK_PRIORITY_VALUES, TASK_STATUS_VALUES, UI_TEXT } from '../config';
import type { AIActionResponse, Task, TaskPreviewChange, TaskPreviewField } from '../types';

export const MAX_HISTORY_LENGTH = 20;

export const isValidPriority = (value: unknown): value is Task['priority'] =>
  typeof value === 'string' && TASK_PRIORITY_VALUES.includes(value as Task['priority']);

export const isValidStatus = (value: unknown): value is Task['status'] =>
  typeof value === 'string' && TASK_STATUS_VALUES.includes(value as Task['status']);

export const normalizeTask = (rawTask: any, fallbackId: number): Task | null => {
  if (!rawTask || typeof rawTask !== 'object') {
    return null;
  }

  const title = typeof rawTask.title === 'string' ? rawTask.title.trim() : '';
  if (!title) {
    return null;
  }

  const description =
    typeof rawTask.description === 'string' && rawTask.description.trim()
      ? rawTask.description.trim()
      : undefined;

  const dueDate =
    typeof rawTask.dueDate === 'string' && rawTask.dueDate.trim()
      ? rawTask.dueDate.trim()
      : undefined;

  const tags = Array.isArray(rawTask.tags)
    ? rawTask.tags
        .filter((tag: unknown): tag is string => typeof tag === 'string')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  return {
    id: typeof rawTask.id === 'number' && Number.isFinite(rawTask.id) ? rawTask.id : fallbackId,
    title,
    description,
    status: isValidStatus(rawTask.status) ? rawTask.status : 'pending',
    priority: isValidPriority(rawTask.priority) ? rawTask.priority : 'medium',
    dueDate,
    tags,
    createdAt:
      typeof rawTask.createdAt === 'string' && rawTask.createdAt.trim()
        ? rawTask.createdAt
        : new Date().toISOString(),
  };
};

export const normalizeTaskList = (rawTasks: unknown): Task[] => {
  if (!Array.isArray(rawTasks)) {
    return [];
  }

  return rawTasks
    .map((task, index) => normalizeTask(task, index + 1))
    .filter((task): task is Task => task !== null);
};

export const reindexTasks = (tasks: Task[]) =>
  normalizeTaskList(tasks).map((task, index) => ({
    ...task,
    id: index + 1,
  }));

export const loadStoredTasks = () => {
  const localTasks = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TASKS);
  if (!localTasks) {
    return null;
  }

  return reindexTasks(JSON.parse(localTasks));
};

export const loadStoredTaskHistory = () => {
  const localHistory = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TASK_HISTORY);
  if (!localHistory) {
    return [];
  }

  const parsedHistory = JSON.parse(localHistory);
  if (!Array.isArray(parsedHistory)) {
    return [];
  }

  return parsedHistory.map((snapshot) => reindexTasks(snapshot));
};

export const saveTaskHistory = (history: Task[][]) => {
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TASK_HISTORY, JSON.stringify(history));
};

export const saveTasksToStorage = (tasks: Task[]) => {
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const parseImportedTasks = (rawData: unknown): Task[] => {
  if (Array.isArray(rawData)) {
    return normalizeTaskList(rawData);
  }

  if (rawData && typeof rawData === 'object' && Array.isArray((rawData as any).tasks)) {
    return normalizeTaskList((rawData as any).tasks);
  }

  throw new Error(UI_TEXT.IMPORT_INVALID_STRUCTURE);
};

export const buildExportPayload = (tasks: Task[]) => ({
  exportedAt: new Date().toISOString(),
  tasks,
});

export const applyParsedActionToTasks = (
  tasks: Task[],
  parsedResponse: AIActionResponse
): Task[] => {
  if (!parsedResponse.success) {
    return tasks;
  }

  let updatedTasks = [...tasks];
  const nextIdVal = updatedTasks.length > 0 ? Math.max(...updatedTasks.map((t) => t.id)) + 1 : 1;

  switch (parsedResponse.action) {
    case 'add':
      if (parsedResponse.task) {
        const normalizedAddedTask = normalizeTask(
          {
            ...parsedResponse.task,
            id: nextIdVal,
            title: parsedResponse.task.title || 'AI 新增',
            description: parsedResponse.task.description ?? undefined,
            priority: parsedResponse.task.priority || 'medium',
            status: parsedResponse.task.status || 'pending',
            dueDate: parsedResponse.task.dueDate ?? undefined,
            tags: parsedResponse.task.tags ?? [],
            createdAt: new Date().toISOString(),
          },
          nextIdVal
        );

        if (normalizedAddedTask) {
          updatedTasks = [...updatedTasks, normalizedAddedTask];
        }
      }
      break;

    case 'update':
      if (parsedResponse.taskId) {
        updatedTasks = updatedTasks.map((task) =>
          task.id === parsedResponse.taskId
            ? normalizeTask(
                {
                  ...task,
                  ...parsedResponse.task,
                  id: task.id,
                  createdAt: parsedResponse.task?.createdAt || task.createdAt,
                  description:
                    parsedResponse.task?.description === null
                      ? undefined
                      : parsedResponse.task?.description ?? task.description,
                  dueDate:
                    parsedResponse.task?.dueDate === null
                      ? undefined
                      : parsedResponse.task?.dueDate ?? task.dueDate,
                  tags: parsedResponse.task?.tags ?? task.tags,
                },
                task.id
              ) || task
            : task
        );
      }
      break;

    case 'update_many':
      if (
        Array.isArray(parsedResponse.taskIds) &&
        Array.isArray(parsedResponse.tasks) &&
        parsedResponse.taskIds.length === parsedResponse.tasks.length
      ) {
        const updatesById = new Map(
          parsedResponse.taskIds.map((id, index) => [id, parsedResponse.tasks?.[index]])
        );

        updatedTasks = updatedTasks.map((task) => {
          const nextTask = updatesById.get(task.id);
          if (!nextTask) {
            return task;
          }

          return (
            normalizeTask(
              {
                ...task,
                ...nextTask,
                id: task.id,
                createdAt: nextTask.createdAt || task.createdAt,
                description:
                  nextTask.description === null ? undefined : nextTask.description ?? task.description,
                dueDate: nextTask.dueDate === null ? undefined : nextTask.dueDate ?? task.dueDate,
                tags: nextTask.tags ?? task.tags,
              },
              task.id
            ) || task
          );
        });
      }
      break;

    case 'delete':
      if (parsedResponse.taskId) {
        updatedTasks = updatedTasks.filter((task) => task.id !== parsedResponse.taskId);
      }
      break;

    case 'batch':
      if (parsedResponse.tasks) {
        let cursorId = nextIdVal;
        updatedTasks = [
          ...updatedTasks,
          ...parsedResponse.tasks
            .map((task) =>
              normalizeTask(
                {
                  ...task,
                  id: cursorId++,
                  title: task.title || '智能节点',
                  description: task.description ?? undefined,
                  priority: task.priority || 'medium',
                  status: task.status || 'pending',
                  dueDate: task.dueDate ?? undefined,
                  tags: task.tags ?? [],
                  createdAt: task.createdAt || new Date().toISOString(),
                },
                cursorId - 1
              )
            )
            .filter((task): task is Task => task !== null),
        ];
      }
      break;

    default:
      break;
  }

  return updatedTasks;
};

const PREVIEW_FIELDS: TaskPreviewField[] = [
  'title',
  'description',
  'priority',
  'status',
  'dueDate',
  'tags',
];

const areStringArraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const areTaskFieldValuesEqual = (field: TaskPreviewField, before: Task, after: Task) => {
  if (field === 'tags') {
    return areStringArraysEqual(before.tags, after.tags);
  }

  return before[field] === after[field];
};

export const buildTaskPreviewChanges = (
  currentTasks: Task[],
  parsedResponse: AIActionResponse
): {
  previewTasks: Task[];
  changes: TaskPreviewChange[];
} => {
  const previewTasks = applyParsedActionToTasks(currentTasks, parsedResponse);
  const changes: TaskPreviewChange[] = [];

  const beforeById = new Map(currentTasks.map((task) => [task.id, task]));
  const afterById = new Map(previewTasks.map((task) => [task.id, task]));

  previewTasks.forEach((task) => {
    const beforeTask = beforeById.get(task.id);
    if (!beforeTask) {
      changes.push({
        taskId: task.id,
        kind: 'added',
        changedFields: PREVIEW_FIELDS.filter((field) =>
          field === 'tags' ? task.tags.length > 0 : Boolean(task[field])
        ),
        isRisky: true,
        riskReason: 'AI 计划新增这条任务，请确认这不是误生成的新条目。',
      });
      return;
    }

    const changedFields = PREVIEW_FIELDS.filter((field) => !areTaskFieldValuesEqual(field, beforeTask, task));
    if (changedFields.length === 0) {
      return;
    }

    changes.push({
      taskId: task.id,
      kind: 'updated',
      changedFields,
      isRisky: false,
    });
  });

  currentTasks.forEach((task) => {
    if (!afterById.has(task.id)) {
      changes.push({
        taskId: task.id,
        kind: 'deleted',
        changedFields: [],
        isRisky: true,
        riskReason: 'AI 计划删除这条任务，请确认这符合你的指令。',
      });
    }
  });

  return {
    previewTasks,
    changes,
  };
};

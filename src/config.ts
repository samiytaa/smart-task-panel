/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task } from './types';

export const TASK_PRIORITY_VALUES: Task['priority'][] = ['low', 'medium', 'high'];
export const TASK_STATUS_VALUES: Task['status'][] = ['pending', 'completed'];

// 应用配置
export const APP_CONFIG = {
  // 应用名称和标识
  APP_NAME: '智能任务管理系统',
  APP_NAME_EN: 'SMART TASK MANAGEMENT PANEL',

  // 本地存储键名
  STORAGE_KEYS: {
    TASKS: 'smart_tasks_data',
    AI_CONFIG: 'smart_tasks_ai_config',
    TASK_HISTORY: 'smart_tasks_history',
    WEBDAV_CONFIG: 'smart_tasks_webdav_config',
  },

  // 动画配置
  ANIMATION: {
    DURATION: 0.2,
    SCALE_DOWN: 0.95,
  },

  // 任务显示配置
  TASK: {
    MAX_DESCRIPTION_LINES: 2,
  },
};

// 初始示例任务数据
export const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: '整理并规划今日核心任务',
    description: '通过控制台进行测试，可在AI助手中输入指令体验自动控制。',
    status: 'pending',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    tags: ['规划', '核心'],
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 2,
    title: '在配置页连接 API 密钥',
    description: '使用预置的免费代理，或填入自定义的 DeepSeek、Ollama 或 OpenAI 接口。',
    status: 'pending',
    priority: 'high',
    dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
    tags: ['基础', '设置'],
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 3,
    title: '体验 AI 指令管理任务',
    description: '在底部 AI 助手中输入自然语言，体验自动创建、修改和删除任务。',
    status: 'completed',
    priority: 'medium',
    tags: ['演示'],
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
];

// AI 快速指令配置
export const AI_QUICK_COMMANDS = [
  {
    label: '规划今日任务',
    text: '规划今天的三项核心工作：写需求、审代码、测部署，设为中等优先级'
  },
  {
    label: '添加高优先级任务',
    text: '添加高优先级任务：在周五前发布V1.0正式版，添加标签"发布, 里程碑"'
  },
  {
    label: '完成任务2',
    text: '把任务2的状态改为已完成'
  },
  {
    label: '调整优先级',
    text: '修改任务3的优先级为高'
  },
];

// 优先级配置
export const PRIORITY_CONFIG = {
  high: {
    label: '紧急',
    color: 'bg-rose-50 text-rose-600 border-rose-150',
    indicator: 'bg-rose-300',
  },
  medium: {
    label: '常规',
    color: 'bg-amber-50 text-amber-700 border-amber-150',
    indicator: 'bg-amber-250',
  },
  low: {
    label: '低',
    color: 'bg-slate-50 text-slate-500 border-slate-150',
    indicator: 'bg-slate-250',
  },
};

// 状态筛选配置
export const STATUS_FILTERS = [
  { value: 'all' as const, label: '全部' },
  { value: 'pending' as const, label: '进行中' },
  { value: 'completed' as const, label: '已完成' },
];

// 标签区域状态筛选配置
export const TAG_STATUS_FILTERS = [
  { value: 'pending' as const, label: '待处理' },
  { value: 'completed' as const, label: '已完成' },
];

// 排序选项配置
export const SORT_OPTIONS = [
  {
    value: 'created' as const,
    label: '创建时间',
  },
  {
    value: 'priority' as const,
    label: '优先级',
  },
  {
    value: 'due' as const,
    label: '截止时间',
  },
];

// UI 文本配置
export const UI_TEXT = {
  SEARCH_PLACEHOLDER: '搜索任务...',
  MANAGEMENT_PANEL_BUTTON: '管理面板',
  MANAGEMENT_PANEL_BADGE: 'Manage',
  MANAGEMENT_PANEL_TITLE: '任务管理面板',
  MANAGEMENT_PANEL_SUBTITLE: '在这里统一浏览概览、快捷筛选、标签管理与批量操作。',
  MANAGEMENT_PANEL_CLOSE: '关闭管理面板',
  MANAGEMENT_PANEL_STATS_TASKS: '任务',
  MANAGEMENT_PANEL_STATS_TAGS: '标签',
  MANAGEMENT_PANEL_STATS_PENDING: '进行中',
  MANAGEMENT_PANEL_OVERVIEW_TITLE: '近期活跃度',
  MANAGEMENT_PANEL_OVERVIEW_HINT: '近 6 周任务创建与完成分布',
  MANAGEMENT_PANEL_TAG_SECTION: '全部标签',
  MANAGEMENT_PANEL_TASK_SECTION: '筛选结果',
  MANAGEMENT_PANEL_WIDGET_TITLE: '批量操作',
  MANAGEMENT_PANEL_WIDGET_HINT: '先勾选任务，再统一处理状态或删除。',
  MANAGEMENT_PANEL_EMPTY_TAGS: '还没有标签',
  NEW_TASK_BUTTON: '新增',
  BULK_ACTION_BUTTON: '批量',
  BULK_MODAL_TITLE: '批量操作',
  BULK_MODAL_SUBTITLE: '',
  BULK_MODAL_CLOSE: '关闭批量操作',
  BULK_SELECT_ALL: '全选当前',
  BULK_CLEAR_SELECTION: '清空选择',
  BULK_MARK_COMPLETED: '批量完成',
  BULK_MARK_PENDING: '恢复进行中',
  BULK_DELETE: '批量删除',
  EXPORT_TASKS_BUTTON: '导出任务',
  IMPORT_TASKS_BUTTON: '导入任务',
  BULK_SELECTED_COUNT: '已选任务',
  CLEAR_COMPLETED_BUTTON: '清除完成',
  UNDO_BUTTON: '撤回上一次',
  UNDO_EMPTY: '没有可撤回的修改',
  AI_PREVIEW_CONFIRM: '确认应用',
  AI_PREVIEW_CANCEL: '放弃这次修改',
  AI_PREVIEW_TITLE: 'AI 修改预览',
  AI_PREVIEW_SUBTITLE: '已用不同颜色标出将被修改的任务，请确认后再正式应用。',
  AI_PREVIEW_EMPTY: '这次 AI 结果没有检测到有效改动。',
  AI_PREVIEW_RISK: '包含可疑改动，请重点检查高亮条目。',
  AI_PREVIEW_SAFE: '已生成待确认修改。',
  AI_PREVIEW_ADDED: '新增',
  AI_PREVIEW_UPDATED: '修改',
  AI_PREVIEW_DELETED: '删除',
  AI_ASSISTANT_TITLE: 'AI 智能助手',
  AI_ASSISTANT_SUBTITLE: '输入指令，AI 自动帮您管理、创建、编辑或删除任务',
  AI_COMMAND_PLACEHOLDER: '',
  QUICK_COMMANDS_LABEL: '快速指令：',
  TAG_FILTER_LABEL: '',
  TAG_FILTER_ALL: '全部',
  SORT_LABEL: '排序方式',
  QUICK_PANEL_TITLE: '选择操作',
  QUICK_PANEL_SORT_VALUE_PREFIX: '',
  QUICK_PANEL_NEW_TASK_HINT: '快速添加一条新的任务记录',
  QUICK_PANEL_SORT_HINT: '当前排序',
  TOTAL_TASKS_LABEL: '个任务',
  STORAGE_INFO: '数据保存在本地存储',
  NO_TASKS: '暂无任务',
  NO_TASKS_HINT: '可以通过AI助手或新增按钮创建任务',
  NO_MATCH: '没有找到匹配的任务',
  NO_MATCH_HINT: '尝试更换筛选条件',
  BULK_NO_MATCH_HINT: '当前筛选下没有可供批量选择的任务',
  CONFIRM_DELETE: '确认删除该任务吗？',
  CONFIRM_BULK_DELETE: '确认删除选中的任务吗？',
  CONFIRM_CLEAR_COMPLETED: '确认清空所有已完成任务吗？',
  IMPORT_MODE_REPLACE: '覆盖当前任务',
  IMPORT_MODE_MERGE: '合并到当前任务',
  IMPORT_SUCCESS_REPLACE: '任务已覆盖导入',
  IMPORT_SUCCESS_MERGE: '任务已合并导入',
  IMPORT_EMPTY_FILE: '导入文件中没有可用的任务数据',
  IMPORT_INVALID_JSON: '导入失败，文件不是有效的 JSON',
  IMPORT_INVALID_STRUCTURE: '导入失败，JSON 必须是任务数组，或包含 tasks 数组',
  EDIT_BUTTON_TITLE: '编辑任务',
  DELETE_BUTTON_TITLE: '删除任务',
  MARK_COMPLETED: '标记为已完成',
  MARK_PENDING: '标记为未完成',
};

// 表单文本配置
export const FORM_TEXT = {
  NEW_TASK_TITLE: '新增',
  EDIT_TASK_TITLE: '编辑任务',
  TITLE_LABEL: '任务标题',
  TITLE_PLACEHOLDER: '例如：完成项目报告',
  DESCRIPTION_LABEL: '任务描述',
  DESCRIPTION_PLACEHOLDER: '添加更多细节说明（可选）...',
  PRIORITY_LABEL: '优先级',
  PRIORITY_LOW: '低',
  PRIORITY_MEDIUM: '中',
  PRIORITY_HIGH: '高',
  DUE_DATE_LABEL: '截止日期',
  TAGS_LABEL: '标签 (以逗号分隔)',
  TAGS_PLACEHOLDER: '例如：工作, 个人, 重要',
  CANCEL_BUTTON: '取消',
  SAVE_BUTTON: '保存',
};

// AI 配置文本
export const AI_CONFIG_TEXT = {
  TITLE: '配置',
  TABS_AI: 'AI 配置',
  TABS_DATA: '数据管理',
  BASE_URL_LABEL: 'API Base URL',
  BASE_URL_PLACEHOLDER: 'https://api.openai.com/v1',
  API_KEY_LABEL: 'API Key',
  API_KEY_PLACEHOLDER: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx',
  MODEL_LABEL: 'Model',
  MODEL_PLACEHOLDER: 'gpt-3.5-turbo',
  FETCH_MODELS_BUTTON: '拉取模型',
  DATA_TITLE: '任务数据',
  DATA_DESCRIPTION: '在这里导出当前任务，或导入 JSON 文件进行覆盖与合并。',
  EXPORT_CARD_TITLE: '导出任务',
  EXPORT_CARD_DESCRIPTION: '将当前任务列表保存为本地 JSON 文件，方便备份或迁移。',
  IMPORT_CARD_TITLE: '导入任务',
  IMPORT_CARD_DESCRIPTION: '支持导入任务数组，或包含 tasks 字段的 JSON 数据。',
  IMPORT_REPLACE_BUTTON: '覆盖导入',
  IMPORT_MERGE_BUTTON: '合并导入',
  TEST_SUCCESS: '测试成功',
  TEST_FAILED: '测试失败',
  ALERT_BASE_URL_REQUIRED: '请先输入 API Base URL',
  ERROR_FETCH_MODELS: '获取模型列表失败',
  ERROR_INVALID_DATA: '返回的数据格式不正确',
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
  createdAt: string;
}

export interface AIConfig {
  provider: 'built-in' | 'custom';
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface WebDAVConfig {
  enabled: boolean;
  url: string;
  username: string;
  password: string;
  filePath: string;
  autoSync: boolean;
}

export interface AIActionResponse {
  success: boolean;
  action: 'add' | 'update' | 'update_many' | 'delete' | 'batch' | 'none';
  message: string;
  task?: {
    id?: number;
    title?: string;
    description?: string | null;
    priority?: Task['priority'];
    status?: Task['status'];
    dueDate?: string | null;
    tags?: string[] | null;
    createdAt?: string;
  };
  tasks?: Array<Partial<Task>>;
  taskId?: number;
  taskIds?: number[];
}

export type TaskPreviewChangeKind = 'added' | 'updated' | 'deleted';

export type TaskPreviewField =
  | 'title'
  | 'description'
  | 'priority'
  | 'status'
  | 'dueDate'
  | 'tags';

export interface TaskPreviewChange {
  taskId: number;
  kind: TaskPreviewChangeKind;
  changedFields: TaskPreviewField[];
  isRisky: boolean;
  riskReason?: string;
}

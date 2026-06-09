/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Task, WebDAVConfig } from '../types';

export class WebDAVService {
  private config: WebDAVConfig;
  private syncInProgress = false;
  private lastSyncTime = 0;
  private syncDebounceTimer: NodeJS.Timeout | null = null;

  constructor(config: WebDAVConfig) {
    this.config = config;
  }

  updateConfig(config: WebDAVConfig) {
    this.config = config;
  }

  /**
   * 测试 WebDAV 连接
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(this.config.url, {
        method: 'OPTIONS',
        headers: this.getAuthHeaders(),
      });

      if (response.ok || response.status === 401) {
        // 401 表示需要认证，但连接正常
        return {
          success: response.ok,
          message: response.ok ? '连接成功' : '认证失败，请检查用户名和密码',
        };
      }

      return {
        success: false,
        message: `连接失败 (HTTP ${response.status})`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `连接失败: ${error.message || '网络错误'}`,
      };
    }
  }

  /**
   * 从 WebDAV 下载任务数据
   */
  async downloadTasks(): Promise<{ success: boolean; tasks?: Task[]; message: string }> {
    if (!this.config.enabled) {
      return { success: false, message: 'WebDAV 同步未启用' };
    }

    try {
      const fileUrl = this.getFileUrl();
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 404) {
        // 文件不存在，返回空任务列表
        return {
          success: true,
          tasks: [],
          message: '远程文件不存在，将在下次上传时创建',
        };
      }

      if (!response.ok) {
        throw new Error(`下载失败 (HTTP ${response.status})`);
      }

      const text = await response.text();
      const tasks = JSON.parse(text) as Task[];

      this.lastSyncTime = Date.now();
      return {
        success: true,
        tasks,
        message: '同步成功',
      };
    } catch (error: any) {
      console.error('下载任务失败:', error);
      return {
        success: false,
        message: `下载失败: ${error.message || '未知错误'}`,
      };
    }
  }

  /**
   * 上传任务数据到 WebDAV
   */
  async uploadTasks(tasks: Task[]): Promise<{ success: boolean; message: string }> {
    if (!this.config.enabled) {
      return { success: false, message: 'WebDAV 同步未启用' };
    }

    if (this.syncInProgress) {
      return { success: false, message: '正在同步中，请稍后' };
    }

    try {
      this.syncInProgress = true;

      // 确保目录存在
      await this.ensureDirectoryExists();

      const fileUrl = this.getFileUrl();
      const response = await fetch(fileUrl, {
        method: 'PUT',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tasks, null, 2),
      });

      if (!response.ok && response.status !== 201 && response.status !== 204) {
        throw new Error(`上传失败 (HTTP ${response.status})`);
      }

      this.lastSyncTime = Date.now();
      return {
        success: true,
        message: '同步成功',
      };
    } catch (error: any) {
      console.error('上传任务失败:', error);
      return {
        success: false,
        message: `上传失败: ${error.message || '未知错误'}`,
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * 防抖上传 - 避免频繁上传
   */
  uploadTasksDebounced(tasks: Task[], delayMs = 3000): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      if (this.syncDebounceTimer) {
        clearTimeout(this.syncDebounceTimer);
      }

      this.syncDebounceTimer = setTimeout(async () => {
        const result = await this.uploadTasks(tasks);
        resolve(result);
      }, delayMs);
    });
  }

  /**
   * 获取最后同步时间
   */
  getLastSyncTime(): number {
    return this.lastSyncTime;
  }

  /**
   * 是否正在同步
   */
  isSyncing(): boolean {
    return this.syncInProgress;
  }

  private getAuthHeaders(): Record<string, string> {
    const auth = btoa(`${this.config.username}:${this.config.password}`);
    return {
      'Authorization': `Basic ${auth}`,
    };
  }

  private getFileUrl(): string {
    const baseUrl = this.config.url.endsWith('/') 
      ? this.config.url 
      : `${this.config.url}/`;
    const filePath = this.config.filePath.startsWith('/') 
      ? this.config.filePath.slice(1) 
      : this.config.filePath;
    return `${baseUrl}${filePath}`;
  }

  private async ensureDirectoryExists(): Promise<void> {
    const parts = this.config.filePath.split('/').filter(Boolean);
    if (parts.length <= 1) {
      return; // 文件在根目录
    }

    const dirPath = parts.slice(0, -1).join('/');
    const dirUrl = this.config.url.endsWith('/') 
      ? `${this.config.url}${dirPath}` 
      : `${this.config.url}/${dirPath}`;

    try {
      await fetch(dirUrl, {
        method: 'MKCOL',
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      // 目录可能已存在，忽略错误
      console.log('创建目录失败或目录已存在:', error);
    }
  }
}

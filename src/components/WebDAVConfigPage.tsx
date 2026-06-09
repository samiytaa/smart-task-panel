/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle2, Cloud, CloudOff, ExternalLink, RefreshCw, Upload } from 'lucide-react';
import React, { useState } from 'react';
import type { Task, WebDAVConfig } from '../types';

interface WebDAVConfigPageProps {
  config: WebDAVConfig;
  onSaveConfig: (config: WebDAVConfig) => void;
  onTestConnection?: () => Promise<{ success: boolean; message: string }>;
  onManualSync?: () => Promise<void>;
  lastSyncTime?: number;
  isSyncing?: boolean;
}

const WEBDAV_PRESETS = [
  {
    name: '坚果云',
    url: 'https://dav.jianguoyun.com/dav/',
    description: '免费 1GB 空间，国内访问快速',
    guideUrl: 'https://help.jianguoyun.com/?p=2064',
  },
  {
    name: 'Nextcloud',
    url: 'https://your-nextcloud.com/remote.php/dav/files/USERNAME/',
    description: '自托管云盘解决方案',
    guideUrl: 'https://docs.nextcloud.com/',
  },
  {
    name: 'ownCloud',
    url: 'https://your-owncloud.com/remote.php/dav/files/USERNAME/',
    description: '开源云存储平台',
    guideUrl: 'https://doc.owncloud.com/',
  },
];

export const WebDAVConfigPage: React.FC<WebDAVConfigPageProps> = ({
  config,
  onSaveConfig,
  onTestConnection,
  onManualSync,
  lastSyncTime,
  isSyncing = false,
}) => {
  const [enabled, setEnabled] = useState(config.enabled);
  const [url, setUrl] = useState(config.url);
  const [username, setUsername] = useState(config.username);
  const [password, setPassword] = useState(config.password);
  const [filePath, setFilePath] = useState(config.filePath || '/smart-tasks/tasks.json');
  const [autoSync, setAutoSync] = useState(config.autoSync);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    const newConfig: WebDAVConfig = {
      enabled,
      url,
      username,
      password,
      filePath,
      autoSync,
    };
    onSaveConfig(newConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!onTestConnection) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    // 先保存配置
    handleSave();
    
    try {
      const result = await onTestConnection();
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || '测试失败',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePresetClick = (preset: typeof WEBDAV_PRESETS[0]) => {
    setUrl(preset.url);
  };

  const formatLastSyncTime = () => {
    if (!lastSyncTime) return '从未同步';
    const now = Date.now();
    const diff = now - lastSyncTime;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return new Date(lastSyncTime).toLocaleString('zh-CN');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* 主配置卡片 */}
      <div className="bg-white rounded-[2rem] p-5 md:p-6 border-2 border-blue-100 cream-puffy-shadow space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-blue-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-blue-100 text-blue-500 rounded-full border border-blue-200 shrink-0">
              <Cloud className="w-5 h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold font-heading text-[#6b5349]">WebDAV 多端同步</h1>
              <p className="text-xs text-[#6b5349]/60 font-semibold mt-0.5">
                配置后任务将自动备份到云端，实现多设备同步
              </p>
            </div>
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">已保存</span>
            </div>
          )}
        </div>

        {/* 同步状态 */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100">
          <div className="flex items-center gap-3">
            {enabled ? (
              <Cloud className="w-5 h-5 text-blue-500" />
            ) : (
              <CloudOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-bold text-[#6b5349]">
                {enabled ? '同步已启用' : '同步未启用'}
              </p>
              <p className="text-xs text-[#6b5349]/60 font-semibold">
                最后同步: {formatLastSyncTime()}
              </p>
            </div>
          </div>
          {enabled && onManualSync && (
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>同步中...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>手动同步</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* 启用开关 */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-100">
          <div>
            <h3 className="text-sm font-bold text-[#6b5349]">启用 WebDAV 同步</h3>
            <p className="text-xs text-[#6b5349]/60 font-semibold mt-0.5">
              开启后将自动同步任务到云端
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        {/* 快速预设 */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#6b5349]">快速配置</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {WEBDAV_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetClick(preset)}
                className="group relative flex flex-col gap-2 p-4 border-2 border-blue-100 rounded-2xl hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-[#6b5349]">{preset.name}</h4>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-[#6b5349]/60 font-semibold leading-relaxed">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
          <p className="text-xs text-[#6b5349]/50 font-semibold leading-relaxed">
            💡 点击预设会自动填充服务器地址，你只需填入账号密码即可
          </p>
        </div>

        {/* 表单 */}
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#6b5349]">
                WebDAV 服务器地址 <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://dav.jianguoyun.com/dav/"
                className="text-sm px-4 py-2.5 border-2 border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-200/30 focus:border-blue-300 outline-none transition-all font-mono text-[#6b5349]"
              />
              <p className="text-xs text-[#6b5349]/50 font-semibold">
                坚果云: https://dav.jianguoyun.com/dav/
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#6b5349]">
                  用户名 <span className="text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your@email.com"
                  className="text-sm px-4 py-2.5 border-2 border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-200/30 focus:border-blue-300 outline-none transition-all text-[#6b5349]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#6b5349]">
                  密码 <span className="text-blue-400">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-sm px-4 py-2.5 border-2 border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-200/30 focus:border-blue-300 outline-none transition-all text-[#6b5349]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#6b5349]">
                存储文件路径 <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="/smart-tasks/tasks.json"
                className="text-sm px-4 py-2.5 border-2 border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-200/30 focus:border-blue-300 outline-none transition-all font-mono text-[#6b5349]"
              />
              <p className="text-xs text-[#6b5349]/50 font-semibold">
                数据将保存在此路径，建议使用 .json 格式
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100">
              <div>
                <h3 className="text-sm font-bold text-[#6b5349]">自动同步</h3>
                <p className="text-xs text-[#6b5349]/60 font-semibold mt-0.5">
                  任务变化后自动上传（3秒防抖）
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 测试结果 */}
        {testResult && (
          <div
            className={`p-4 rounded-2xl border-2 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <p
              className={`text-sm font-bold ${
                testResult.success ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {testResult.success ? '✓ ' : '✗ '}{testResult.message}
            </p>
          </div>
        )}

        {/* 按钮 */}
        <div className="flex flex-col gap-3 border-t-2 border-blue-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || !url || !username || !password}
            className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full border-2 border-blue-200 bg-white hover:bg-blue-50 text-blue-600 text-sm font-bold cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            <span>{isTesting ? '测试中...' : '测试连接'}</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold cursor-pointer transition-all active:scale-95"
          >
            <span>保存配置</span>
          </button>
        </div>
      </div>

      {/* 坚果云帮助 */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2rem] p-5 border-2 border-amber-100">
        <h3 className="text-sm font-bold text-amber-900 mb-3">📖 坚果云 WebDAV 配置指南</h3>
        <ol className="space-y-2 text-xs text-amber-800/80 font-semibold leading-relaxed list-decimal list-inside">
          <li>登录坚果云网页版，进入「账户信息」→「安全选项」</li>
          <li>找到「第三方应用管理」，添加应用密码</li>
          <li>应用名称填写「Smart Task Panel」，生成密码</li>
          <li>服务器地址: <code className="bg-white px-1 rounded">https://dav.jianguoyun.com/dav/</code></li>
          <li>用户名: 你的坚果云邮箱</li>
          <li>密码: 刚生成的应用密码（不是登录密码）</li>
        </ol>
        <a
          href="https://help.jianguoyun.com/?p=2064"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-amber-700 hover:text-amber-800 text-xs font-bold underline"
        >
          查看官方文档 <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* 隐私说明 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] p-5 border-2 border-blue-100">
        <h3 className="text-sm font-bold text-blue-900 mb-2">🔒 隐私与安全</h3>
        <ul className="space-y-1 text-xs text-blue-800/80 font-semibold leading-relaxed list-disc list-inside">
          <li>所有同步操作直接在浏览器和 WebDAV 服务器之间进行</li>
          <li>账号密码仅保存在浏览器本地，不会发送到其他服务器</li>
          <li>数据传输使用 HTTPS 加密（请确保 WebDAV 服务器支持 HTTPS）</li>
          <li>建议定期备份数据，使用「导出任务」功能保存本地副本</li>
        </ul>
      </div>
    </div>
  );
};

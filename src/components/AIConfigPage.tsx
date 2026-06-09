/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle2, ExternalLink, RefreshCw, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AIConfig } from '../types';

interface AIConfigPageProps {
  config: AIConfig;
  onSaveConfig: (newConfig: AIConfig) => void;
}

const AI_PRESETS = [
  {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    keyUrl: 'https://platform.openai.com/api-keys',
    description: '官方 OpenAI API，稳定可靠',
  },
  {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    keyUrl: 'https://platform.deepseek.com/',
    description: '性价比高，速度快',
  },
  {
    name: 'Ollama (本地)',
    baseUrl: 'http://localhost:11434/v1',
    model: 'llama3',
    keyUrl: 'https://ollama.ai/',
    description: '本地运行，完全免费',
  },
];

interface AIConfigPageProps {
  config: AIConfig;
  onSaveConfig: (newConfig: AIConfig) => void;
}

export const AIConfigPage: React.FC<AIConfigPageProps> = ({ config, onSaveConfig }) => {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [baseUrl, setBaseUrl] = useState(config.baseUrl);
  const [model, setModel] = useState(config.model);
  const [models, setModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 自动保存配置
  useEffect(() => {
    onSaveConfig({
      provider: 'custom',
      apiKey,
      baseUrl,
      model,
    });
    
    // 显示保存成功提示
    if (apiKey && baseUrl && model) {
      setSaveSuccess(true);
      const timer = setTimeout(() => setSaveSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [apiKey, baseUrl, model, onSaveConfig]);

  const handlePresetClick = (preset: typeof AI_PRESETS[0]) => {
    setBaseUrl(preset.baseUrl);
    setModel(preset.model);
  };

  const handleFetchModels = async () => {
    if (!baseUrl) {
      alert('请先输入 API Base URL');
      return;
    }

    setIsLoadingModels(true);
    try {
      const url = baseUrl.endsWith('/') ? `${baseUrl}models` : `${baseUrl}/models`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`获取模型列表失败 (HTTP ${response.status})`);
      }

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        const modelIds = data.data.map((m: any) => m.id).sort((a: string, b: string) => a.localeCompare(b));
        setModels(modelIds);
        if (modelIds.length > 0 && !model) {
          setModel(modelIds[0]);
        }
      } else {
        throw new Error('返回的数据格式不正确');
      }
    } catch (err: any) {
      console.error(err);
      alert(`获取模型列表失败: ${err.message || err}`);
      setModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* 主配置卡片 */}
      <div className="bg-white rounded-[2rem] p-5 md:p-6 border-2 border-rose-100 cream-puffy-shadow space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-rose-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-rose-100 text-rose-500 rounded-full border border-rose-200 shrink-0">
              <Settings className="w-5 h-5 text-rose-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold font-heading text-[#6b5349]">AI 配置</h1>
              <p className="text-xs text-[#6b5349]/60 font-semibold mt-0.5">
                配置后即可使用自然语言管理任务
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

        {/* 快速预设 */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#6b5349]">快速配置</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {AI_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetClick(preset)}
                className="group relative flex flex-col gap-2 p-4 border-2 border-rose-100 rounded-2xl hover:border-rose-300 hover:bg-rose-50/50 transition-all text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-[#6b5349]">{preset.name}</h4>
                  <ExternalLink className="w-3.5 h-3.5 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-[#6b5349]/60 font-semibold leading-relaxed">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
          <p className="text-xs text-[#6b5349]/50 font-semibold leading-relaxed">
            💡 点击预设会自动填充 Base URL 和 Model，你只需要填入 API Key
          </p>
        </div>

        {/* 表单 */}
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-[#6b5349]">
                API Base URL <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="text-sm px-4 py-2.5 border-2 border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-200/30 focus:border-rose-300 outline-none transition-all font-mono text-[#6b5349]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#6b5349]">
                API Key <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                className="text-sm px-4 py-2.5 border-2 border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-200/30 focus:border-rose-300 outline-none transition-all font-mono text-[#6b5349]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#6b5349]">
                Model <span className="text-rose-400">*</span>
              </label>
              {models.length > 0 ? (
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="text-sm px-4 py-2.5 border-2 border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-200/30 focus:border-rose-300 outline-none transition-all font-mono text-[#6b5349] bg-white"
                >
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="gpt-4o-mini"
                  className="text-sm px-4 py-2.5 border-2 border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-200/30 focus:border-rose-300 outline-none transition-all font-mono text-[#6b5349]"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t-2 border-rose-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={handleFetchModels}
            disabled={isLoadingModels || !baseUrl || !apiKey}
            className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full pink-primary-puffy text-white text-sm font-bold cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingModels ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            <span>拉取模型列表</span>
          </button>
        </div>
      </div>

      {/* 帮助信息 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] p-5 border-2 border-blue-100">
        <h3 className="text-sm font-bold text-blue-900 mb-3">💡 获取 API Key</h3>
        <div className="space-y-2 text-xs text-blue-800/80 font-semibold leading-relaxed">
          {AI_PRESETS.map((preset) => (
            <div key={preset.name}>
              <strong className="text-blue-900">{preset.name}:</strong>{' '}
              <a
                href={preset.keyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                {preset.keyUrl}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 隐私说明 */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[2rem] p-5 border-2 border-emerald-100">
        <h3 className="text-sm font-bold text-emerald-900 mb-2">🔒 隐私保护</h3>
        <ul className="space-y-1 text-xs text-emerald-800/80 font-semibold leading-relaxed list-disc list-inside">
          <li>API Key 仅保存在浏览器本地存储，不会上传到任何服务器</li>
          <li>所有 AI 请求直接从浏览器发送到您配置的 API 服务</li>
          <li>任务数据也完全保存在本地，不会离开您的设备</li>
        </ul>
      </div>
    </div>
  );
};

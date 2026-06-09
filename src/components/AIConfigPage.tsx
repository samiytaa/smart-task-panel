/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle, RefreshCw, Settings, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AIConfig } from '../types';

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

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // 自动保存配置
  useEffect(() => {
    onSaveConfig({
      provider: 'custom',
      apiKey,
      baseUrl,
      model,
    });
  }, [apiKey, baseUrl, model, onSaveConfig]);

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

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const configSnapshot: AIConfig = {
      provider: 'custom',
      apiKey,
      baseUrl,
      model,
    };

    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: '测试连接',
          tasks: [],
          aiConfig: configSnapshot,
        }),
      });

      if (!response.ok) {
        throw new Error(`服务端异常 (HTTP ${response.status})`);
      }

      const data = await response.json();
      if (data.success || data.action) {
        setTestResult({
          success: true,
          message: `连接成功！操作类型：${data.action}。`,
        });
      } else {
        setTestResult({
          success: false,
          message: `AI 接口返回了意外格式: ${JSON.stringify(data)}`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setTestResult({
        success: false,
        message: `连接失败: ${err.message || err}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-[2rem] p-5 md:p-6 border-2 border-rose-100 cream-puffy-shadow space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-rose-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-rose-100 text-rose-500 rounded-full border border-rose-200 shrink-0">
              <Settings className="w-5 h-5 text-rose-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold font-heading text-[#6b5349]">配置</h1>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-[#6b5349]">API Base URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="text-sm px-4 py-2.5 border-2 border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-200/30 focus:border-rose-300 outline-none transition-all font-mono text-[#6b5349]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#6b5349]">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                className="text-sm px-4 py-2.5 border-2 border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-200/30 focus:border-rose-300 outline-none transition-all font-mono text-[#6b5349]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#6b5349]">Model</label>
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
                  placeholder="gpt-3.5-turbo"
                  className="text-sm px-4 py-2.5 border-2 border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-200/30 focus:border-rose-300 outline-none transition-all font-mono text-[#6b5349]"
                />
              )}
            </div>
          </div>
        </div>



        {testResult && (
          <div
            className={`px-4 py-3 rounded-2xl text-xs flex gap-2.5 items-start ${testResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
          >
            {testResult.success ? (
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold mb-0.5">{testResult.success ? '测试成功' : '测试失败'}</p>
              <p className="leading-relaxed font-semibold">{testResult.message}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t-2 border-rose-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={handleFetchModels}
            disabled={isLoadingModels || !baseUrl}
            className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full pink-primary-puffy text-white text-sm font-bold cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingModels ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            <span>拉取模型</span>
          </button>
        </div>
      </div>
    </div>
  );
};

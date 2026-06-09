/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AIConfig } from '../types';
import { Settings, AlertTriangle, RefreshCw, Sparkles, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AI_CONFIG_TEXT, APP_CONFIG } from '../config';
import type { ChangeEvent, RefObject } from 'react';

interface AIConfigModalProps {
  config: AIConfig;
  onSaveConfig: (newConfig: AIConfig) => void;
  onExportTasks: () => void;
  onOpenImportDialog: (mode: 'replace' | 'merge') => void;
  onImportTasks: (event: ChangeEvent<HTMLInputElement>, mode: 'replace' | 'merge') => void;
  importFileRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
}

export const AIConfigModal: React.FC<AIConfigModalProps> = ({
  config,
  onSaveConfig,
  onExportTasks,
  onOpenImportDialog,
  onImportTasks,
  importFileRef,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [baseUrl, setBaseUrl] = useState(config.baseUrl);
  const [model, setModel] = useState(config.model);
  const [models, setModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai'>('ai');
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
      alert(AI_CONFIG_TEXT.ALERT_BASE_URL_REQUIRED);
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
        throw new Error(`${AI_CONFIG_TEXT.ERROR_FETCH_MODELS} (HTTP ${response.status})`);
      }

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        const modelIds = data.data.map((m: any) => m.id).sort((a: string, b: string) => a.localeCompare(b));
        setModels(modelIds);
        if (modelIds.length > 0 && !model) {
          setModel(modelIds[0]);
        }
      } else {
        throw new Error(AI_CONFIG_TEXT.ERROR_INVALID_DATA);
      }
    } catch (err: any) {
      console.error(err);
      alert(`${AI_CONFIG_TEXT.ERROR_FETCH_MODELS}: ${err.message || err}`);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl"
      >
        <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-[2rem] border-2 border-rose-100 bg-white cream-puffy-shadow">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-rose-100 px-5 pb-4 pt-5 md:px-6 md:pt-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-rose-100 text-rose-500 rounded-full border border-rose-200 shrink-0">
                <Settings className="w-5 h-5 text-rose-400" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold font-heading text-[#6b5349]">AI配置</h1>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-rose-50 rounded-full transition-colors text-rose-400 hover:text-rose-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-5 md:px-6 md:pb-6">
            <div className="space-y-5">
              <>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-[#6b5349]">{AI_CONFIG_TEXT.BASE_URL_LABEL}</label>
                        <input
                          type="text"
                          value={baseUrl}
                          onChange={(e) => setBaseUrl(e.target.value)}
                          placeholder={AI_CONFIG_TEXT.BASE_URL_PLACEHOLDER}
                          className="text-sm px-4 py-2.5 border-2 border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-200/30 focus:border-rose-300 outline-none transition-all font-mono text-[#6b5349]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#6b5349]">{AI_CONFIG_TEXT.API_KEY_LABEL}</label>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder={AI_CONFIG_TEXT.API_KEY_PLACEHOLDER}
                          className="text-sm px-4 py-2.5 border-2 border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-200/30 focus:border-rose-300 outline-none transition-all font-mono text-[#6b5349]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#6b5349]">{AI_CONFIG_TEXT.MODEL_LABEL}</label>
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
                            placeholder={AI_CONFIG_TEXT.MODEL_PLACEHOLDER}
                            className="text-sm px-4 py-2.5 border-2 border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-200/30 focus:border-rose-300 outline-none transition-all font-mono text-[#6b5349]"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {testResult && (
                    <div
                      className={`px-4 py-3 rounded-2xl text-xs flex gap-2.5 items-start ${
                        testResult.success
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
                        <p className="font-bold mb-0.5">{testResult.success ? AI_CONFIG_TEXT.TEST_SUCCESS : AI_CONFIG_TEXT.TEST_FAILED}</p>
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
                      <span>{AI_CONFIG_TEXT.FETCH_MODELS_BUTTON}</span>
                    </button>
                  </div>
                </>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

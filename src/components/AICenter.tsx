/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowUp, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIActionResponse, AIConfig, Task } from '../types';
import { UI_TEXT } from '../config';
import { parseTaskInstruction } from '../services/aiService';

interface AICenterProps {
  tasks: Task[];
  aiConfig: AIConfig;
  onApplyParsedAction: (actionData: AIActionResponse) => void;
}

export const AICenter: React.FC<AICenterProps> = ({ tasks, aiConfig, onApplyParsedAction }) => {
  const [command, setCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResultMessage, setLastResultMessage] = useState<string | null>(null);
  const [feedbackTime, setFeedbackTime] = useState<string | null>(null);

  useEffect(() => {
    if (!error && !lastResultMessage) {
      return;
    }

    const dismissTimer = window.setTimeout(() => {
      setError(null);
      setLastResultMessage(null);
      setFeedbackTime(null);
    }, 3000);

    return () => window.clearTimeout(dismissTimer);
  }, [error, lastResultMessage, feedbackTime]);

  const handleCommandSubmit = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setIsLoading(true);
    setError(null);
    setLastResultMessage(null);
    setFeedbackTime(null);

    try {
      const result = await parseTaskInstruction(textToSend, tasks, aiConfig);
      
      if (!result.success && result.action === 'none') {
        setError(result.message || 'AI 无法理解该指令，请换一种方式表达。');
        setFeedbackTime(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
      } else {
        setLastResultMessage(result.message || UI_TEXT.AI_PREVIEW_SAFE);
        setFeedbackTime(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
        onApplyParsedAction(result);
        if (textToSend === command) {
          setCommand('');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '连接失败，请检查 AI 配置。');
      setFeedbackTime(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pointer-events-none relative w-full">
      {/* Result feedback */}
      <AnimatePresence mode="wait">
        {(error || lastResultMessage) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute bottom-full left-1/2 mb-2 w-[min(100%,42rem)] -translate-x-1/2 overflow-hidden sm:mb-3"
          >
            {error && (
              <div className="pointer-events-auto flex items-start gap-2 rounded-2xl border border-rose-200 bg-white/95 p-2.5 text-xs font-semibold leading-relaxed text-rose-700 shadow-[0_14px_35px_rgba(120,60,60,0.12)] backdrop-blur-xl sm:p-3 sm:text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span>{error}</span>
                    {feedbackTime ? (
                      <span className="shrink-0 text-[10px] font-bold text-rose-400 sm:text-[11px]">{feedbackTime}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
            {lastResultMessage && (
              <div className="pointer-events-auto flex items-start gap-2 rounded-2xl border border-emerald-200 bg-white/95 p-2.5 text-xs font-semibold leading-relaxed text-emerald-800 shadow-[0_14px_35px_rgba(16,120,80,0.12)] backdrop-blur-xl sm:p-3 sm:text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span>{lastResultMessage}</span>
                    {feedbackTime ? (
                      <span className="shrink-0 text-[10px] font-bold text-emerald-500/70 sm:text-[11px]">{feedbackTime}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCommandSubmit(command);
        }}
        className="pointer-events-auto relative flex min-h-[52px] w-full items-center gap-2 rounded-[26px] border border-zinc-200/90 bg-white/95 px-2 py-2 text-[#33302f] shadow-[0_18px_45px_rgba(15,23,42,0.13),0_2px_8px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-xl transition-all focus-within:border-zinc-300 focus-within:shadow-[0_20px_55px_rgba(15,23,42,0.16),0_0_0_4px_rgba(255,255,255,0.55)] sm:min-h-[62px] sm:rounded-[31px] sm:px-3"
      >
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          disabled={isLoading}
          placeholder={UI_TEXT.AI_COMMAND_PLACEHOLDER}
          className="min-w-0 flex-1 border-none bg-transparent px-2 text-sm font-medium text-zinc-700 outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed sm:px-3 sm:text-base"
        />
        <button
          type="submit"
          disabled={isLoading || !command.trim()}
          className="mobile-touch-target flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-pink-200 via-rose-200 to-pink-300 shadow-[0_2px_12px_rgba(251,207,232,0.4),inset_0_1px_1px_rgba(255,255,255,0.5)] transition-all hover:shadow-[0_4px_16px_rgba(251,207,232,0.5)] hover:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-zinc-200/80 disabled:text-zinc-400 disabled:shadow-none sm:h-10 sm:w-10"
          title="发送指令"
        >
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin text-rose-600 sm:h-4 sm:w-4" /> : <ArrowUp className="h-4 w-4 stroke-[2.5] text-rose-600 sm:h-4.5 sm:w-4.5" />}
        </button>
      </form>
    </div>
  );
};

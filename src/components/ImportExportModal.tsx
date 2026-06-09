/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Download, Upload, X } from 'lucide-react';

interface ImportExportModalProps {
  onClose: () => void;
  onSelectMode: (mode: 'replace' | 'merge') => void;
}

export function ImportExportModal({ onClose, onSelectMode }: ImportExportModalProps) {
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
        className="w-full max-w-md"
      >
        <div className="flex flex-col overflow-hidden rounded-[2rem] border-2 border-rose-100 bg-white cream-puffy-shadow">
          <div className="flex items-center justify-between gap-3 border-b-2 border-rose-100 px-5 pb-4 pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-500 rounded-full border border-rose-200 shrink-0">
                <Upload className="w-5 h-5 text-rose-400 rotate-180" />
              </div>
              <h2 className="text-lg font-bold text-[#6b5349]">选择导入模式</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-rose-50 rounded-full transition-colors text-rose-400 hover:text-rose-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 py-5 space-y-3">
            <button
              type="button"
              onClick={() => {
                onSelectMode('replace');
                onClose();
              }}
              className="w-full flex flex-col gap-2 rounded-2xl border-2 border-rose-200 bg-rose-50 px-5 py-4 text-left transition-all hover:bg-rose-100 hover:border-rose-300 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white rounded-full border border-rose-200">
                  <Download className="w-4 h-4 text-rose-500" />
                </div>
                <span className="text-base font-bold text-[#6b5349]">覆盖导入</span>
              </div>
              <p className="text-xs text-rose-600 leading-relaxed">
                删除现有的所有任务，替换为导入文件中的任务。适用于完全替换数据的场景。
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectMode('merge');
                onClose();
              }}
              className="w-full flex flex-col gap-2 rounded-2xl border-2 border-rose-200 bg-white px-5 py-4 text-left transition-all hover:bg-rose-50 hover:border-rose-300 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 rounded-full border border-rose-200">
                  <Upload className="w-4 h-4 text-rose-500 rotate-180" />
                </div>
                <span className="text-base font-bold text-[#6b5349]">合并导入</span>
              </div>
              <p className="text-xs text-rose-600 leading-relaxed">
                保留现有任务，将导入文件中的任务添加到列表中。适用于增量导入数据的场景。
              </p>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

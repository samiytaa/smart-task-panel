import {
  Hash,
  Download,
  Upload,
  Settings,
  CheckSquare,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { TAG_STATUS_FILTERS, UI_TEXT } from '../config';
import type { Task } from '../types';

interface TagSummary {
  tag: string;
  totalCount: number;
  pendingCount: number;
  completedCount: number;
  isComplete: boolean;
}

interface ManagementPanelProps {
  isOpen: boolean;
  tasks: Task[];
  selectedTag: string | null;
  onSelectedTagChange: (value: string | null) => void;
  bulkStatusFilter: 'all' | 'pending' | 'completed';
  setBulkStatusFilter: (value: 'all' | 'pending' | 'completed') => void;
  onClose: () => void;
  onExportTasks: () => void;
  onOpenImportDialog: () => void;
  onOpenConfig: () => void;
  onOpenBulkAction: () => void;
}

export function ManagementPanel({
  isOpen,
  tasks,
  selectedTag,
  onSelectedTagChange,
  bulkStatusFilter,
  setBulkStatusFilter,
  onClose,
  onExportTasks,
  onOpenImportDialog,
  onOpenConfig,
  onOpenBulkAction,
}: ManagementPanelProps) {
  const tagSummaries = Array.from(new Set(tasks.flatMap((task) => task.tags ?? [])))
    .map<TagSummary>((tag) => {
      const tagTasks = tasks.filter((task) => task.tags.includes(tag));
      const pendingCount = tagTasks.filter((task) => task.status === 'pending').length;
      const completedCount = tagTasks.length - pendingCount;

      return {
        tag,
        totalCount: tagTasks.length,
        pendingCount,
        completedCount,
        isComplete: pendingCount === 0,
      };
    })
    .sort((a, b) => {
      if (a.isComplete !== b.isComplete) {
        return Number(a.isComplete) - Number(b.isComplete);
      }

      if (b.pendingCount !== a.pendingCount) {
        return b.pendingCount - a.pendingCount;
      }

      if (b.totalCount !== a.totalCount) {
        return b.totalCount - a.totalCount;
      }

      return a.tag.localeCompare(b.tag, 'zh-CN');
    });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#6b5349]/18 backdrop-blur-[2px]"
            onClick={onClose}
            aria-label={UI_TEXT.MANAGEMENT_PANEL_CLOSE}
          />

          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="fixed inset-y-0 left-0 z-[60] flex w-[80vw] max-w-[20rem] flex-col border-r border-rose-100/80 bg-[var(--color-cream-base)] shadow-[0_20px_60px_rgba(120,60,60,0.18)] sm:w-full sm:max-w-[26rem]"
            aria-label={UI_TEXT.MANAGEMENT_PANEL_TITLE}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto px-3 py-3.5 sm:px-5 sm:py-5">
              <div className="space-y-3 sm:space-y-4">
                <section className="rounded-[1.25rem] border border-rose-100/80 bg-white/75 p-3 sm:rounded-[1.7rem] sm:p-4">
                  <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-3">
                    <p className="text-xs font-bold text-[#5a4842] sm:text-sm">
                      {UI_TEXT.MANAGEMENT_PANEL_TAG_SECTION}
                    </p>
                    <div className="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50/60 px-2 py-1 text-[10px] font-bold text-rose-500 sm:text-[11px]">
                      <Hash className="h-3 w-3" />
                      {tagSummaries.length}
                    </div>
                  </div>

                  <div className="mb-2.5 flex flex-wrap gap-1.5 sm:mb-3 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectedTagChange(null)}
                      className={`mobile-touch-target rounded-full border px-2.5 py-1.5 text-[11px] font-bold transition-all sm:px-3 sm:text-xs ${
                        selectedTag === null
                          ? 'border-rose-200 bg-rose-150 text-[#6b5349]'
                          : 'border-rose-100 bg-rose-50/20 text-rose-500 hover:bg-rose-50'
                      }`}
                    >
                      {UI_TEXT.TAG_FILTER_ALL}
                    </button>
                    {TAG_STATUS_FILTERS.map((chip) => (
                      <button
                        key={chip.value}
                        type="button"
                        onClick={() => setBulkStatusFilter(chip.value)}
                        className={`mobile-touch-target rounded-full border px-2.5 py-1.5 text-[11px] font-bold transition-all sm:px-3 sm:text-xs ${
                          bulkStatusFilter === chip.value
                            ? 'border-rose-200 bg-white text-[#6b5349]'
                            : 'border-rose-100 bg-rose-50/20 text-rose-500 hover:bg-rose-50'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {tagSummaries.length > 0 ? (
                    <div className="space-y-1.5 sm:space-y-2">
                      {tagSummaries.map((summary) => {
                        const isActive = selectedTag === summary.tag;

                        return (
                          <button
                            key={summary.tag}
                            type="button"
                            onClick={() => onSelectedTagChange(summary.tag)}
                            className={`mobile-touch-target flex w-full items-center justify-between rounded-[0.875rem] border px-2.5 py-2 text-left transition-all sm:rounded-[1.05rem] sm:px-3 sm:py-2.5 ${
                              isActive
                                ? summary.isComplete
                                  ? 'border-rose-100 bg-stone-50/90 opacity-75'
                                  : 'border-rose-200 bg-rose-50/70'
                                : summary.isComplete
                                  ? 'border-transparent bg-stone-50/70 opacity-55 hover:border-stone-200 hover:bg-stone-100/80 hover:opacity-70'
                                  : 'border-transparent bg-rose-50/20 hover:border-rose-100 hover:bg-rose-50/40'
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                              <span
                                className={`text-sm font-bold sm:text-base ${
                                  summary.isComplete ? 'text-stone-400' : 'text-[#5a4842]'
                                }`}
                              >
                                #
                              </span>
                              <span
                                className={`truncate text-sm font-semibold sm:text-base ${
                                  summary.isComplete ? 'text-stone-400' : 'text-[#5a4842]'
                                }`}
                              >
                                {summary.tag}
                              </span>
                            </div>
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-bold sm:text-[11px] ${
                                summary.isComplete
                                  ? 'bg-white/70 text-stone-400'
                                  : 'bg-white/80 text-rose-500'
                              }`}
                              aria-label={`${summary.tag} 未完成任务 ${summary.pendingCount} 个`}
                              title={`未完成 ${summary.pendingCount} / 总计 ${summary.totalCount}`}
                            >
                              {summary.pendingCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-[0.875rem] border border-dashed border-rose-200 bg-rose-50/20 px-3 py-4 text-center text-xs text-rose-400 sm:rounded-[1.2rem] sm:py-5 sm:text-sm">
                      {UI_TEXT.MANAGEMENT_PANEL_EMPTY_TAGS}
                    </div>
                  )}
                </section>
              </div>
            </div>

            <div className="border-t border-rose-100/80 px-3.5 py-2 sm:px-5 sm:py-2.5">
              <div className="flex items-center justify-center gap-5 sm:gap-7">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBulkAction();
                  }}
                  className="mobile-touch-target flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-rose-400 transition-all hover:text-rose-500 active:scale-95"
                  title="批量操作"
                  aria-label="批量操作"
                >
                  <CheckSquare className="h-5 w-5 stroke-[2.2]" />
                </button>
                <button
                  type="button"
                  onClick={onOpenConfig}
                  className="mobile-touch-target flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-rose-400 transition-all hover:text-rose-500 active:scale-95"
                  title="AI配置"
                  aria-label="AI配置"
                >
                  <Settings className="h-5 w-5 stroke-[2.2]" />
                </button>
                <button
                  type="button"
                  onClick={onExportTasks}
                  className="mobile-touch-target flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-rose-400 transition-all hover:text-rose-500 active:scale-95"
                  title="导出任务"
                  aria-label="导出任务"
                >
                  <Download className="h-5 w-5 stroke-[2.2]" />
                </button>
                <button
                  type="button"
                  onClick={onOpenImportDialog}
                  className="mobile-touch-target flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-rose-400 transition-all hover:text-rose-500 active:scale-95"
                  title="导入任务"
                  aria-label="导入任务"
                >
                  <Upload className="h-5 w-5 rotate-180 stroke-[2.2]" />
                </button>
              </div>
            </div>

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Task, TaskPreviewChange } from '../types';
import { Trash2, Calendar, Check, Circle, Ellipsis, PencilLine } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { PRIORITY_CONFIG, UI_TEXT } from '../config';

interface TaskItemProps {
  task: Task;
  onToggleStatus: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  isBulkMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
  selectionOnlyMode?: boolean;
  previewChange?: TaskPreviewChange;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  isBulkMode = false,
  isSelected = false,
  onToggleSelect,
  selectionOnlyMode = false,
  previewChange,
}) => {
  const getPriorityIndicator = (priority: Task['priority']) => {
    return PRIORITY_CONFIG[priority]?.indicator || PRIORITY_CONFIG.low.indicator;
  };

  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const getPriorityAccent = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return {
          shell: 'border-rose-200/90 bg-rose-50/45 hover:border-rose-300',
          idBadge: 'bg-rose-100 text-rose-500',
          toggleActive: 'bg-gradient-to-br from-rose-200 to-rose-300 border-rose-300 text-[#6b5349]',
          toggleIdle: 'border-rose-200 bg-white text-transparent hover:text-rose-200 hover:border-rose-300',
        };
      case 'medium':
        return {
          shell: 'border-amber-200/90 bg-amber-50/35 hover:border-amber-300',
          idBadge: 'bg-amber-100 text-amber-600',
          toggleActive: 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300 text-amber-700',
          toggleIdle: 'border-amber-200 bg-white text-transparent hover:text-amber-300 hover:border-amber-300',
        };
      case 'low':
      default:
        return {
          shell: 'border-slate-200/90 bg-slate-50/40 hover:border-slate-300',
          idBadge: 'bg-slate-100 text-slate-500',
          toggleActive: 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300 text-slate-600',
          toggleIdle: 'border-slate-200 bg-white text-transparent hover:text-slate-300 hover:border-slate-300',
        };
    }
  };

  const isCompleted = task.status === 'completed';
  const isPreviewUpdated = previewChange?.kind === 'updated';
  const isPreviewAdded = previewChange?.kind === 'added';
  const isPreviewDeleted = previewChange?.kind === 'deleted';
  const isPreviewRisky = Boolean(previewChange?.isRisky);
  const priorityAccent = getPriorityAccent(task.priority);

  const previewShellClass = isPreviewRisky
    ? 'border-amber-300 bg-amber-50/70 shadow-[0_16px_34px_rgba(217,119,6,0.15)]'
    : isPreviewAdded
      ? 'border-emerald-300 bg-emerald-50/65 shadow-[0_16px_34px_rgba(16,185,129,0.12)]'
      : isPreviewUpdated
        ? 'border-sky-300 bg-sky-50/65 shadow-[0_16px_34px_rgba(56,189,248,0.12)]'
        : isPreviewDeleted
          ? 'border-rose-300 bg-rose-50/70 shadow-[0_16px_34px_rgba(244,114,182,0.12)]'
          : '';

  const previewBadgeClass = isPreviewRisky
    ? 'border-amber-300 bg-amber-100 text-amber-800'
    : isPreviewAdded
      ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
      : isPreviewUpdated
        ? 'border-sky-300 bg-sky-100 text-sky-800'
        : 'border-rose-300 bg-rose-100 text-rose-700';

  const previewLabel = isPreviewAdded ? 'AI新增' : isPreviewDeleted ? 'AI删除' : isPreviewUpdated ? 'AI修改' : '';

  useEffect(() => {
    if (!isActionMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!actionMenuRef.current?.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsActionMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isActionMenuOpen]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      id={`task-item-${task.id}`}
      className={`group relative flex items-start gap-2.5 rounded-[1.35rem] border-2 p-3 hover:shadow-md transition-all sm:gap-4 sm:rounded-2xl sm:p-5 ${
        isCompleted ? 'border-rose-100/40 bg-rose-50/20 opacity-75' : `cream-puffy-shadow ${priorityAccent.shell}`
      } ${previewShellClass} ${
        isPreviewDeleted ? 'ring-1 ring-rose-300/70 ring-offset-1' : ''
      }`}
    >
      {/* Priority indicator */}
      <div
        className={`absolute bottom-2.5 left-0 top-2.5 w-1 rounded-r-lg sm:bottom-3 sm:top-3 sm:w-1.5 ${getPriorityIndicator(task.priority)}`}
      />

      {/* Task Content */}
      <div className="flex min-w-0 flex-grow items-start gap-2.5 pl-1.5 sm:gap-3 sm:pl-2">
        {isBulkMode && (
          <button
            onClick={() => onToggleSelect?.(task.id)}
            className={`mt-0.5 flex h-5.5 w-5.5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all cursor-pointer sm:mt-1 sm:h-6 sm:w-6 ${
              isSelected
                ? priorityAccent.toggleActive
                : priorityAccent.toggleIdle
            }`}
            aria-label={isSelected ? '取消选择任务' : '选择任务'}
          >
            {isSelected ? <Check className="h-3 w-3 stroke-[3.5] sm:h-3.5 sm:w-3.5" /> : <Circle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
          </button>
        )}

        {!selectionOnlyMode && (
          <button
            onClick={() => onToggleStatus(task.id)}
            className={`mt-0.5 flex h-5.5 w-5.5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all cursor-pointer sm:mt-1 sm:h-6 sm:w-6 ${
              isCompleted
                ? 'bg-gradient-to-br from-rose-150 to-rose-200 border-rose-300 text-[#6b5349]'
                : priorityAccent.toggleIdle
            }`}
            aria-label={isCompleted ? UI_TEXT.MARK_PENDING : UI_TEXT.MARK_COMPLETED}
          >
            {isCompleted ? <Check className="h-3 w-3 stroke-[3.5] sm:h-3.5 sm:w-3.5" /> : <Circle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
          </button>
        )}

        <div className="min-w-0 flex-grow">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:gap-2">
                  <span
                    className={`select-none rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold sm:text-[10px] ${priorityAccent.idBadge}`}
                  >
                    #{task.id}
                  </span>

                  {task.dueDate && (
                    <div className="flex items-center gap-1 rounded-full border border-rose-50 bg-amber-50/70 px-2 py-0.5 text-[10px] font-medium text-rose-600 sm:text-[11px]">
                      <Calendar className="h-3 w-3 text-rose-300" />
                      <span>{task.dueDate}</span>
                    </div>
                  )}

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex min-w-0 flex-wrap items-center gap-1">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-rose-100/50 bg-rose-50/65 px-2 py-0.5 text-[9px] font-bold text-rose-600 sm:text-[10px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {previewChange && (
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold sm:text-[10px] ${previewBadgeClass}`}>
                      {previewLabel}
                    </span>
                  )}
                </div>

                {!selectionOnlyMode && (
                  <div ref={actionMenuRef} className="relative z-20 shrink-0 self-start">
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }}
                      className="flex items-center justify-end"
                    >
                      <AnimatePresence initial={false}>
                        {isActionMenuOpen && (
                          <motion.div
                            key="action-buttons"
                            initial={{ width: 0, opacity: 0, x: 8 }}
                            animate={{ width: 'auto', opacity: 1, x: 0 }}
                            exit={{ width: 0, opacity: 0, x: 8 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="flex items-center gap-1 overflow-hidden"
                          >
                            <motion.button
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              transition={{ duration: 0.16 }}
                              onClick={() => {
                                setIsActionMenuOpen(false);
                                onEdit(task);
                              }}
                              className="flex h-5 w-5 items-center justify-center text-rose-400 transition-[transform,color] duration-200 hover:text-rose-600 active:scale-90 sm:h-[1.1rem] sm:w-[1.1rem]"
                              title={UI_TEXT.EDIT_BUTTON_TITLE}
                              aria-label={UI_TEXT.EDIT_BUTTON_TITLE}
                            >
                              <PencilLine className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </motion.button>

                            <motion.button
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              transition={{ duration: 0.16, delay: 0.02 }}
                              onClick={() => {
                                setIsActionMenuOpen(false);
                                onDelete(task.id);
                              }}
                              className="flex h-5 w-5 items-center justify-center text-rose-400 transition-[transform,color] duration-200 hover:text-rose-600 active:scale-90 sm:h-[1.1rem] sm:w-[1.1rem]"
                              title={UI_TEXT.DELETE_BUTTON_TITLE}
                              aria-label={UI_TEXT.DELETE_BUTTON_TITLE}
                            >
                              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        animate={{ rotate: isActionMenuOpen ? 90 : 0 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        onClick={() => setIsActionMenuOpen((current) => !current)}
                        className="flex h-5 w-5 items-center justify-center text-rose-400 transition-[color] duration-200 hover:text-rose-600 sm:h-[1.1rem] sm:w-[1.1rem]"
                        title="更多操作"
                        aria-label="更多操作"
                        aria-expanded={isActionMenuOpen}
                      >
                        <Ellipsis className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </motion.button>
                    </motion.div>
                  </div>
                )}
              </div>

              <h3
                className={`mt-1.5 truncate font-heading text-base font-bold text-[#5a4842] transition-all sm:mt-2 sm:text-lg ${
                  isCompleted ? 'line-through text-rose-300 font-normal' : ''
                }`}
              >
                {task.title}
              </h3>

              {task.description && (
                <p
                  className={`mt-1 break-words text-[13px] leading-relaxed text-[#6b5349] sm:text-sm ${
                    isCompleted ? 'text-rose-300' : ''
                  }`}
                >
                  {task.description}
                </p>
              )}
            </div>

          </div>

          {previewChange?.changedFields.length ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-rose-400 sm:mt-2 sm:text-sm">
              {previewChange.changedFields.map((field) => (
                <span
                  key={field}
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold sm:text-[11px] ${
                    isPreviewRisky
                      ? 'border-amber-300/80 bg-amber-100/80 text-amber-800'
                      : 'border-sky-200 bg-sky-100/80 text-sky-700'
                  }`}
                >
                  {field}
                </span>
              ))}
            </div>
          ) : null}

          {previewChange?.riskReason ? (
            <p className="mt-1.5 rounded-2xl border border-amber-300/70 bg-amber-100/70 px-3 py-2 text-[11px] font-semibold leading-relaxed text-amber-900 sm:mt-2 sm:text-xs">
              {previewChange.riskReason}
            </p>
          ) : null}
        </div>
      </div>

    </motion.div>
  );
};

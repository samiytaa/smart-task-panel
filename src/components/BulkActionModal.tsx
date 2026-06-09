import { AlertCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { STATUS_FILTERS, UI_TEXT } from '../config';
import type { Task } from '../types';
import { TaskItem } from './TaskItem';

interface BulkActionModalProps {
  isOpen: boolean;
  tasks: Task[];
  bulkStatusFilter: 'all' | 'pending' | 'completed';
  setBulkStatusFilter: (value: 'all' | 'pending' | 'completed') => void;
  selectedTaskIds: number[];
  bulkFilteredTasks: Task[];
  areAllFilteredTasksSelected: boolean;
  hasSelectedPendingTasks: boolean;
  hasSelectedCompletedTasks: boolean;
  onClose: () => void;
  onSelectAllFilteredTasks: () => void;
  onBulkUpdateStatusAndClose: (status: Task['status']) => void;
  onBulkDelete: () => void;
  onToggleTaskSelection: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

export function BulkActionModal({
  isOpen,
  tasks,
  bulkStatusFilter,
  setBulkStatusFilter,
  selectedTaskIds,
  bulkFilteredTasks,
  areAllFilteredTasksSelected,
  hasSelectedPendingTasks,
  hasSelectedCompletedTasks,
  onClose,
  onSelectAllFilteredTasks,
  onBulkUpdateStatusAndClose,
  onBulkDelete,
  onToggleTaskSelection,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
}: BulkActionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#6b5349]/28 px-4 py-6 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border-2 border-rose-100 bg-[var(--color-cream-base)] shadow-[0_28px_80px_rgba(120,60,60,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-rose-100/80 bg-white/90 px-5 py-4 md:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-heading font-bold text-[#5a4842]">
                    {UI_TEXT.BULK_MODAL_TITLE}
                  </h2>
                  <p className="mt-1 text-sm text-rose-400">{UI_TEXT.BULK_MODAL_SUBTITLE}</p>
                </div>
                <button
                  onClick={onClose}
                  title={UI_TEXT.BULK_MODAL_CLOSE}
                  aria-label={UI_TEXT.BULK_MODAL_CLOSE}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-400 transition-all hover:bg-rose-50 hover:text-rose-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="border-b border-rose-100/80 bg-rose-50/45 px-5 py-4 text-xs md:px-6 md:text-sm">
              <div className="flex flex-col gap-3">
                <div className="-mx-1 min-w-0 overflow-x-auto pb-1">
                  <div className="inline-flex min-w-max items-center gap-1 rounded-full border border-rose-100 bg-amber-50/60 p-1 text-xs font-bold text-rose-600/80">
                    {STATUS_FILTERS.map((filter) => {
                      const count =
                        filter.value === 'all'
                          ? tasks.length
                          : filter.value === 'pending'
                            ? tasks.filter((task) => task.status === 'pending').length
                            : tasks.filter((task) => task.status === 'completed').length;

                      return (
                        <button
                          key={filter.value}
                          onClick={() => setBulkStatusFilter(filter.value)}
                          title={filter.label}
                          aria-label={`${filter.label} ${count}`}
                          className={`min-w-fit whitespace-nowrap rounded-full px-3.5 py-2 sm:py-1.5 transition-all cursor-pointer ${
                            bulkStatusFilter === filter.value
                              ? 'bg-gradient-to-r from-rose-100 to-rose-150 text-[#6b5349] shadow-xs font-bold'
                              : 'hover:text-[#6b5349] hover:bg-rose-50/50'
                          }`}
                        >
                          <span>{filter.label}</span>{' '}
                          <span className="text-[10px] opacity-75">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <span className="font-bold text-[#6b5349] text-sm md:text-base">
                  {UI_TEXT.BULK_SELECTED_COUNT} {selectedTaskIds.length}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={onSelectAllFilteredTasks}
                    className="rounded-full border border-rose-200 bg-white px-3.5 py-2 font-bold text-rose-500 transition-all hover:bg-rose-50 cursor-pointer"
                  >
                    {areAllFilteredTasksSelected
                      ? UI_TEXT.BULK_CLEAR_SELECTION
                      : UI_TEXT.BULK_SELECT_ALL}
                  </button>
                  <button
                    onClick={() => onBulkUpdateStatusAndClose('completed')}
                    disabled={!hasSelectedPendingTasks}
                    className="rounded-full border border-rose-200 bg-white px-3 py-2 font-bold text-rose-500 transition-all hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  >
                    {UI_TEXT.BULK_MARK_COMPLETED}
                  </button>
                  <button
                    onClick={() => onBulkUpdateStatusAndClose('pending')}
                    disabled={!hasSelectedCompletedTasks}
                    className="rounded-full border border-rose-200 bg-white px-3 py-2 font-bold text-rose-500 transition-all hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  >
                    {UI_TEXT.BULK_MARK_PENDING}
                  </button>
                  <button
                    onClick={onBulkDelete}
                    disabled={selectedTaskIds.length === 0}
                    className="rounded-full border border-rose-200 bg-white px-3 py-2 font-bold text-rose-500 transition-all hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  >
                    {UI_TEXT.BULK_DELETE}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {bulkFilteredTasks.length > 0 ? (
                    bulkFilteredTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggleStatus={onToggleStatus}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        isBulkMode
                        isSelected={selectedTaskIds.includes(task.id)}
                        onToggleSelect={onToggleTaskSelection}
                        selectionOnlyMode
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-14 bg-white rounded-[1.5rem] border border-dashed border-rose-200 text-rose-400 space-y-2.5"
                    >
                      <AlertCircle className="w-12 h-12 mx-auto text-rose-300" />
                      <p className="text-sm font-bold text-[#6b5349]">{UI_TEXT.NO_MATCH}</p>
                      <p className="text-xs text-rose-400">{UI_TEXT.BULK_NO_MATCH_HINT}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

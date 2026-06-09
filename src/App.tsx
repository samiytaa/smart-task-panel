/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AICenter } from './components/AICenter';
import { AIConfigModal } from './components/AIConfigModal';
import { BulkActionModal } from './components/BulkActionModal';
import { ImportExportModal } from './components/ImportExportModal';
import { ManagementPanel } from './components/ManagementPanel';
import { TaskForm } from './components/TaskForm';
import { TaskItem } from './components/TaskItem';
import { TaskToolbar } from './components/TaskToolbar';
import { APP_CONFIG, INITIAL_TASKS, UI_TEXT } from './config';
import {
  applyParsedActionToTasks,
  buildTaskPreviewChanges,
  buildExportPayload,
  loadStoredTaskHistory,
  loadStoredTasks,
  MAX_HISTORY_LENGTH,
  parseImportedTasks,
  reindexTasks,
  saveTaskHistory,
  saveTasksToStorage,
} from './lib/taskUtils';
import type { AIActionResponse, AIConfig, Task, TaskPreviewChange } from './types';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskHistory, setTaskHistory] = useState<Task[][]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [bulkStatusFilter, setBulkStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'priority' | 'due'>('created');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isManagementPanelOpen, setIsManagementPanelOpen] = useState(false);
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingAiAction, setPendingAiAction] = useState<AIActionResponse | null>(null);
  const [pendingPreviewTasks, setPendingPreviewTasks] = useState<Task[] | null>(null);
  const [pendingPreviewChanges, setPendingPreviewChanges] = useState<TaskPreviewChange[]>([]);
  const [aiConfig, setAIConfig] = useState<AIConfig>({
    provider: 'custom',
    apiKey: '',
    baseUrl: '',
    model: '',
  });

  const importFileRef = useRef<HTMLInputElement | null>(null);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const storedTasks = loadStoredTasks();
      setTasks(storedTasks ?? INITIAL_TASKS);
    } catch {
      setTasks(INITIAL_TASKS);
    }

    const localConfig = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AI_CONFIG);
    if (localConfig) {
      try {
        setAIConfig(JSON.parse(localConfig));
      } catch {
        // use default config
      }
    }

    try {
      setTaskHistory(loadStoredTaskHistory());
    } catch {
      setTaskHistory([]);
    }
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!sortMenuRef.current?.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSortMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isManagementPanelOpen) {
      return;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousTouchAction = body.style.touchAction;

    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';

    return () => {
      body.style.overflow = previousOverflow;
      body.style.touchAction = previousTouchAction;
    };
  }, [isManagementPanelOpen]);

  const handleSaveTasks = (newTasks: Task[], options?: { recordHistory?: boolean }) => {
    const shouldRecordHistory = options?.recordHistory !== false;
    const normalizedTasks = reindexTasks(newTasks);

    if (shouldRecordHistory) {
      const currentSnapshot = reindexTasks(tasks);
      const nextHistory = [...taskHistory, currentSnapshot].slice(-MAX_HISTORY_LENGTH);
      setTaskHistory(nextHistory);
      saveTaskHistory(nextHistory);
    }

    setTasks(normalizedTasks);
    saveTasksToStorage(normalizedTasks);
  };

  const handleSaveAIConfig = (newConfig: AIConfig) => {
    setAIConfig(newConfig);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AI_CONFIG, JSON.stringify(newConfig));
  };

  const handleToggleStatus = (id: number) => {
    handleSaveTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: (task.status === 'pending' ? 'completed' : 'pending') as Task['status'],
            }
          : task
      )
    );
  };

  const handleToggleTaskSelection = (id: number) => {
    setSelectedTaskIds((current) =>
      current.includes(id) ? current.filter((taskId) => taskId !== id) : [...current, id]
    );
  };

  const handleOpenManagementPanel = () => {
    setIsManagementPanelOpen(true);
  };

  const handleCloseManagementPanel = () => {
    setIsManagementPanelOpen(false);
  };

  const handleOpenBulkActionModal = () => {
    setIsBulkActionModalOpen(true);
  };

  const handleCloseBulkActionModal = () => {
    setIsBulkActionModalOpen(false);
    setSelectedTaskIds([]);
  };

  const handleOpenNewForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteTask = (id: number) => {
    if (!confirm(UI_TEXT.CONFIRM_DELETE)) {
      return;
    }

    const updated = tasks.filter((task) => task.id !== id);
    handleSaveTasks(updated);
    setSelectedTaskIds((current) => current.filter((taskId) => taskId !== id));
  };

  const handleSaveForm = (formData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      handleSaveTasks(
        tasks.map((task) => (task.id === editingTask.id ? { ...task, ...formData } : task))
      );
    } else {
      const nextId = tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;
      handleSaveTasks([
        ...tasks,
        {
          id: nextId,
          ...formData,
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    setIsFormOpen(false);
  };

  const handleApplyParsedAction = (parsedResponse: AIActionResponse) => {
    const { previewTasks, changes } = buildTaskPreviewChanges(tasks, parsedResponse);

    if (changes.length === 0) {
      alert(UI_TEXT.AI_PREVIEW_EMPTY);
      return;
    }

    setPendingAiAction(parsedResponse);
    setPendingPreviewTasks(previewTasks);
    setPendingPreviewChanges(changes);
  };

  const handleConfirmAiPreview = () => {
    if (!pendingAiAction || !pendingPreviewTasks) {
      return;
    }

    handleSaveTasks(pendingPreviewTasks);
    setPendingAiAction(null);
    setPendingPreviewTasks(null);
    setPendingPreviewChanges([]);
  };

  const handleCancelAiPreview = () => {
    setPendingAiAction(null);
    setPendingPreviewTasks(null);
    setPendingPreviewChanges([]);
  };

  const handleClearCompleted = () => {
    if (!confirm(UI_TEXT.CONFIRM_CLEAR_COMPLETED)) {
      return;
    }

    const filtered = tasks.filter((task) => task.status === 'pending');
    handleSaveTasks(filtered);
    setSelectedTaskIds((current) =>
      current.filter((taskId) => filtered.some((task) => task.id === taskId))
    );
  };

  const handleExportTasks = () => {
    const blob = new Blob([JSON.stringify(buildExportPayload(tasks), null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-tasks-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTasks = async (
    event: ChangeEvent<HTMLInputElement>,
    mode: 'replace' | 'merge'
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const fileText = await file.text();
      let parsedJson: unknown;

      try {
        parsedJson = JSON.parse(fileText);
      } catch {
        throw new Error(UI_TEXT.IMPORT_INVALID_JSON);
      }

      const importedTasks = parseImportedTasks(parsedJson);
      if (importedTasks.length === 0) {
        throw new Error(UI_TEXT.IMPORT_EMPTY_FILE);
      }

      handleSaveTasks(mode === 'replace' ? importedTasks : [...tasks, ...importedTasks]);
      alert(mode === 'replace' ? UI_TEXT.IMPORT_SUCCESS_REPLACE : UI_TEXT.IMPORT_SUCCESS_MERGE);
    } catch (error: any) {
      alert(error.message || UI_TEXT.IMPORT_INVALID_JSON);
    } finally {
      event.target.value = '';
    }
  };

  const handleOpenImportDialog = (mode: 'replace' | 'merge') => {
    const input = importFileRef.current;
    if (!input) {
      return;
    }

    input.dataset.mode = mode;
    input.click();
  };

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
  };

  const handleSelectImportMode = (mode: 'replace' | 'merge') => {
    handleOpenImportDialog(mode);
  };

  const filteredAndSortedTasks = useMemo(() => {
    const sourceTasks = pendingPreviewTasks ?? tasks;
    let result = [...sourceTasks];

    if (selectedTag) {
      result = result.filter((task) => task.tags.includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    result.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'completed' ? 1 : -1;
      }

      if (sortBy === 'priority') {
        const priorityWeights = { high: 3, medium: 2, low: 1 };
        return priorityWeights[b.priority] - priorityWeights[a.priority];
      }

      if (sortBy === 'due') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [tasks, pendingPreviewTasks, selectedTag, searchQuery, sortBy]);

  const bulkFilteredTasks = useMemo(() => {
    const result = filteredAndSortedTasks;

    if (bulkStatusFilter === 'all') {
      return result;
    }

    return result.filter((task) => task.status === bulkStatusFilter);
  }, [bulkStatusFilter, filteredAndSortedTasks]);

  const areAllFilteredTasksSelected =
    bulkFilteredTasks.length > 0 &&
    bulkFilteredTasks.every((task) => selectedTaskIds.includes(task.id));

  const hasSelectedPendingTasks = tasks.some(
    (task) => selectedTaskIds.includes(task.id) && task.status === 'pending'
  );

  const hasSelectedCompletedTasks = tasks.some(
    (task) => selectedTaskIds.includes(task.id) && task.status === 'completed'
  );

  const previewChangeMap = useMemo(
    () => new Map(pendingPreviewChanges.map((change) => [change.taskId, change])),
    [pendingPreviewChanges]
  );

  const hasRiskyPreviewChanges = pendingPreviewChanges.some((change) => change.isRisky);

  const handleSelectAllFilteredTasks = () => {
    if (areAllFilteredTasksSelected) {
      setSelectedTaskIds([]);
      return;
    }

    setSelectedTaskIds(bulkFilteredTasks.map((task) => task.id));
  };

  const handleBulkUpdateStatusAndClose = (status: Task['status']) => {
    if (selectedTaskIds.length === 0) {
      return;
    }

    handleSaveTasks(
      tasks.map((task) => (selectedTaskIds.includes(task.id) ? { ...task, status } : task))
    );
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedTaskIds.length === 0) {
      return;
    }

    if (!confirm(UI_TEXT.CONFIRM_BULK_DELETE)) {
      return;
    }

    handleSaveTasks(tasks.filter((task) => !selectedTaskIds.includes(task.id)));
    setSelectedTaskIds([]);
  };

  const handleUndoLastChange = () => {
    if (taskHistory.length === 0) {
      alert(UI_TEXT.UNDO_EMPTY);
      return;
    }

    const previousSnapshot = taskHistory[taskHistory.length - 1];
    const remainingHistory = taskHistory.slice(0, -1);
    setTaskHistory(remainingHistory);
    saveTaskHistory(remainingHistory);
    handleSaveTasks(previousSnapshot, { recordHistory: false });
    setSelectedTaskIds([]);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--color-cream-base)] pb-[5.5rem] antialiased selection:bg-rose-100 selection:text-rose-700 sm:pb-[6.75rem]">
      <input
        ref={importFileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) =>
          handleImportTasks(
            event,
            ((event.target as HTMLInputElement).dataset.mode as 'replace' | 'merge') || 'merge'
          )
        }
      />

      <ManagementPanel
        isOpen={isManagementPanelOpen}
        tasks={tasks}
        selectedTag={selectedTag}
        onSelectedTagChange={setSelectedTag}
        bulkStatusFilter={bulkStatusFilter}
        setBulkStatusFilter={setBulkStatusFilter}
        onClose={handleCloseManagementPanel}
        onExportTasks={handleExportTasks}
        onOpenImportDialog={handleOpenImportModal}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onOpenBulkAction={handleOpenBulkActionModal}
      />

      <BulkActionModal
        isOpen={isBulkActionModalOpen}
        tasks={tasks}
        bulkStatusFilter={bulkStatusFilter}
        setBulkStatusFilter={setBulkStatusFilter}
        selectedTaskIds={selectedTaskIds}
        bulkFilteredTasks={bulkFilteredTasks}
        areAllFilteredTasksSelected={areAllFilteredTasksSelected}
        hasSelectedPendingTasks={hasSelectedPendingTasks}
        hasSelectedCompletedTasks={hasSelectedCompletedTasks}
        onClose={handleCloseBulkActionModal}
        onSelectAllFilteredTasks={handleSelectAllFilteredTasks}
        onBulkUpdateStatusAndClose={handleBulkUpdateStatusAndClose}
        onBulkDelete={handleBulkDelete}
        onToggleTaskSelection={handleToggleTaskSelection}
        onToggleStatus={handleToggleStatus}
        onEditTask={handleOpenEditForm}
        onDeleteTask={handleDeleteTask}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-grow flex-col px-3 pt-[4.5rem] pb-0 transition-all duration-300 sm:px-4 sm:pt-[5rem] md:pt-[5.25rem]">
        <div className="space-y-2.5 sm:space-y-4">
          <div className="space-y-2 sm:space-y-3">
            <TaskToolbar
              onOpenManagementPanel={handleOpenManagementPanel}
              onOpenNewForm={handleOpenNewForm}
              onUndoLastChange={handleUndoLastChange}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              sortMenuRef={sortMenuRef}
              isSortMenuOpen={isSortMenuOpen}
              setIsSortMenuOpen={setIsSortMenuOpen}
              sortBy={sortBy}
              setSortBy={setSortBy}
              taskHistoryLength={taskHistory.length}
            />

            {pendingAiAction && (
              <div
                className={`rounded-[1.25rem] border px-3 py-2.5 text-xs shadow-[0_16px_34px_rgba(15,23,42,0.08)] sm:rounded-[1.75rem] sm:px-4 sm:py-4 sm:text-sm ${
                  hasRiskyPreviewChanges
                    ? 'border-amber-300 bg-amber-50/90 text-amber-900'
                    : 'border-sky-200 bg-sky-50/90 text-sky-900'
                }`}
              >
                <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:gap-3">
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-sm font-bold sm:text-base">{UI_TEXT.AI_PREVIEW_TITLE}</p>
                    <p className="text-[10px] font-semibold opacity-80 sm:text-xs">
                      {hasRiskyPreviewChanges ? UI_TEXT.AI_PREVIEW_RISK : UI_TEXT.AI_PREVIEW_SUBTITLE}
                    </p>
                    <p className="text-[10px] opacity-75 sm:text-xs">{pendingAiAction.message || UI_TEXT.AI_PREVIEW_SAFE}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleCancelAiPreview}
                      className="mobile-touch-target cursor-pointer rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-bold text-amber-900 transition-all hover:bg-white sm:text-sm"
                    >
                      {UI_TEXT.AI_PREVIEW_CANCEL}
                    </button>
                    <button
                      onClick={handleConfirmAiPreview}
                      className={`mobile-touch-target cursor-pointer rounded-full px-4 py-2 text-xs font-bold text-white transition-all sm:text-sm ${
                        hasRiskyPreviewChanges
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : 'bg-sky-500 hover:bg-sky-600'
                      }`}
                    >
                      {UI_TEXT.AI_PREVIEW_CONFIRM}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-0.5 pb-0.5 sm:space-y-3 sm:pt-1 sm:pb-1">
              <AnimatePresence mode="popLayout">
                {bulkFilteredTasks.length > 0 ? (
                  bulkFilteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onEdit={handleOpenEditForm}
                      onDelete={handleDeleteTask}
                      isBulkMode={false}
                      isSelected={selectedTaskIds.includes(task.id)}
                      onToggleSelect={handleToggleTaskSelection}
                      selectionOnlyMode={false}
                      previewChange={previewChangeMap.get(task.id)}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1.5 rounded-[1.25rem] border border-dashed border-rose-200 bg-rose-50/20 py-10 text-center text-rose-400 sm:space-y-2.5 sm:rounded-[1.5rem] sm:py-14"
                  >
                    <AlertCircle className="mx-auto h-9 w-9 text-rose-300 sm:h-12 sm:w-12" />
                    <p className="text-sm font-bold text-[#6b5349] sm:text-base">
                      {tasks.length === 0 ? UI_TEXT.NO_TASKS : UI_TEXT.NO_MATCH}
                    </p>
                    <p className="text-xs text-rose-400 sm:text-sm">
                      {tasks.length === 0 ? UI_TEXT.NO_TASKS_HINT : UI_TEXT.NO_MATCH_HINT}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isFormOpen && (
          <TaskForm task={editingTask} onSave={handleSaveForm} onClose={() => setIsFormOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isImportModalOpen && (
          <ImportExportModal
            onClose={() => setIsImportModalOpen(false)}
            onSelectMode={handleSelectImportMode}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfigModalOpen && (
          <AIConfigModal
            config={aiConfig}
            onSaveConfig={handleSaveAIConfig}
            onExportTasks={handleExportTasks}
            onOpenImportDialog={handleOpenImportDialog}
            onImportTasks={handleImportTasks}
            importFileRef={importFileRef}
            onClose={() => setIsConfigModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[var(--color-cream-base)] via-[var(--color-cream-base)]/92 to-transparent px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pt-4 sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-6xl">
          <AICenter
            tasks={tasks}
            aiConfig={aiConfig}
            onApplyParsedAction={handleApplyParsedAction}
          />
        </div>
      </div>
    </div>
  );
}

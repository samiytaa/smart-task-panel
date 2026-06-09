import type { RefObject } from 'react';
import { useState } from 'react';
import { Check, ChevronDown, Menu, Plus, Search, Undo2 } from 'lucide-react';
import { SORT_OPTIONS, UI_TEXT } from '../config';

interface TaskToolbarProps {
  onOpenManagementPanel: () => void;
  onOpenNewForm: () => void;
  onUndoLastChange: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  sortMenuRef: RefObject<HTMLDivElement | null>;
  isSortMenuOpen: boolean;
  setIsSortMenuOpen: (value: boolean | ((current: boolean) => boolean)) => void;
  sortBy: 'created' | 'priority' | 'due';
  setSortBy: (value: 'created' | 'priority' | 'due') => void;
  taskHistoryLength: number;
}

export function TaskToolbar({
  onOpenManagementPanel,
  onOpenNewForm,
  onUndoLastChange,
  searchQuery,
  onSearchQueryChange,
  sortMenuRef,
  isSortMenuOpen,
  setIsSortMenuOpen,
  sortBy,
  setSortBy,
  taskHistoryLength,
}: TaskToolbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="fixed inset-x-0 top-0 z-40">
      <div className="w-full space-y-1.5 bg-[var(--color-cream-base)]/96 px-3 py-2 backdrop-blur-xl sm:space-y-2 sm:px-4 sm:py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={onOpenManagementPanel}
              title={UI_TEXT.MANAGEMENT_PANEL_BUTTON}
              aria-label={UI_TEXT.MANAGEMENT_PANEL_BUTTON}
              className="mobile-touch-target flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-100/80 hover:text-slate-600 active:scale-95 sm:h-10 sm:w-10"
            >
              <Menu className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </button>

            <div ref={sortMenuRef} className="relative shrink-0">
              <button
                type="button"
                className="mobile-touch-target flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-100/80 hover:text-slate-600 active:scale-95 sm:h-10 sm:w-10"
                aria-haspopup="listbox"
                aria-expanded={isSortMenuOpen}
                title={UI_TEXT.SORT_LABEL}
                aria-label={UI_TEXT.SORT_LABEL}
                onClick={() => setIsSortMenuOpen((current) => !current)}
              >
                <ChevronDown
                  className={`h-4.5 w-4.5 shrink-0 text-slate-500 transition-transform sm:h-5 sm:w-5 ${isSortMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isSortMenuOpen ? (
                <div
                  className="absolute left-0 top-full z-30 mt-1.5 w-auto min-w-[8rem] max-w-[min(15rem,calc(100vw-2.5rem))] overflow-hidden rounded-[0.875rem] border border-rose-100 bg-white/98 shadow-[0_8px_24px_rgba(120,60,60,0.08)] backdrop-blur-xl sm:rounded-[1rem]"
                  role="listbox"
                  aria-label={UI_TEXT.SORT_LABEL}
                >
                  {SORT_OPTIONS.map((option) => {
                    const isActive = option.value === sortBy;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={`flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left transition-all sm:gap-2.5 sm:px-3 sm:py-2.5 ${
                          isActive
                            ? 'bg-rose-50 text-[#6b5349]'
                            : 'text-rose-500 hover:bg-rose-50/60 hover:text-[#6b5349]'
                        }`}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortMenuOpen(false);
                        }}
                      >
                        <div className="flex-1">
                          <p className="whitespace-nowrap text-sm font-extrabold leading-tight sm:text-[0.9375rem]">{option.label}</p>
                        </div>
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center sm:h-4.5 sm:w-4.5">
                          {isActive ? <Check className="h-3.5 w-3.5 text-emerald-400 sm:h-4 sm:w-4" /> : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setIsSearchOpen((current) => !current)}
              title={UI_TEXT.SEARCH_PLACEHOLDER}
              aria-label={UI_TEXT.SEARCH_PLACEHOLDER}
              className={`mobile-touch-target flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-all active:scale-95 sm:h-10 sm:w-10 ${
                isSearchOpen
                  ? 'bg-slate-100 text-slate-600'
                  : 'hover:bg-slate-100/80 hover:text-slate-600'
              }`}
            >
              <Search className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </button>

            <button
              type="button"
              onClick={onOpenNewForm}
              title={UI_TEXT.NEW_TASK_BUTTON}
              aria-label={UI_TEXT.NEW_TASK_BUTTON}
              className="mobile-touch-target flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-100/80 hover:text-slate-600 active:scale-95 sm:h-10 sm:w-10"
            >
              <Plus className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </button>

            <button
              type="button"
              onClick={onUndoLastChange}
              title={UI_TEXT.UNDO_BUTTON}
              aria-label={UI_TEXT.UNDO_BUTTON}
              disabled={taskHistoryLength === 0}
              className="mobile-touch-target flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-100/80 hover:text-slate-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
            >
              <Undo2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {isSearchOpen ? (
          <div className="rounded-[1rem] border border-slate-200 bg-white/92 px-3 py-2 sm:rounded-[1.1rem] sm:py-2.5">
            <label className="flex items-center gap-2.5 sm:gap-3">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder={UI_TEXT.SEARCH_PLACEHOLDER}
                className="w-full bg-transparent text-sm font-semibold text-slate-600 outline-none placeholder:text-slate-300"
              />
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
}

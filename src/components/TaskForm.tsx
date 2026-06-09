/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { X, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { FORM_TEXT } from '../config';

interface TaskFormProps {
  task?: Task | null;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setTags(task.tags || []);
      setTagInput('');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setTags([]);
      setTagInput('');
    }
  }, [task]);

  const handleAddTag = () => {
    const newTags = tagInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0 && !tags.includes(tag));
    
    if (newTags.length > 0) {
      setTags([...tags, ...newTags]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      // 当输入框为空且按下退格键时，删除最后一个标签
      setTags(tags.slice(0, -1));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status: task ? task.status : 'pending',
      dueDate: dueDate || undefined,
      tags: tags,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6b5349]/30 p-3 backdrop-blur-xs sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] border-2 border-rose-200 bg-white cream-puffy-shadow sm:max-h-[88vh] sm:rounded-[2rem]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-rose-100 bg-rose-50/30 px-4 py-4 sm:px-5 sm:py-5">
          <h2 className="text-base font-bold font-heading text-[#6b5349] flex items-center gap-1.5 justify-center w-full sm:text-lg">
            <span>{task ? FORM_TEXT.EDIT_TASK_TITLE : FORM_TEXT.NEW_TASK_TITLE}</span>
          </h2>
          <button
            onClick={onClose}
            className="mobile-touch-target p-1.5 rounded-full text-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-colors absolute right-3 cursor-pointer sm:right-4"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col text-[#5a4842]">
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 sm:gap-5">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#6b5349] flex items-center gap-1 sm:text-sm">
                  <span>{FORM_TEXT.TITLE_LABEL}</span> <span className="text-rose-400 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={FORM_TEXT.TITLE_PLACEHOLDER}
                  className="w-full rounded-full border-2 border-rose-100 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-rose-200 focus:border-rose-300 focus:ring-4 focus:ring-rose-200/30"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#6b5349] sm:text-sm">{FORM_TEXT.DESCRIPTION_LABEL}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={FORM_TEXT.DESCRIPTION_PLACEHOLDER}
                  rows={4}
                  className="w-full resize-none rounded-[1.25rem] border-2 border-rose-100 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-rose-200 focus:border-rose-300 focus:ring-4 focus:ring-rose-200/30 sm:rounded-[1.35rem]"
                />
              </div>

              {/* Priority & Due Date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Priority */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#6b5349] sm:text-sm">{FORM_TEXT.PRIORITY_LABEL}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((p) => {
                      const labels = {
                        low: FORM_TEXT.PRIORITY_LOW,
                        medium: FORM_TEXT.PRIORITY_MEDIUM,
                        high: FORM_TEXT.PRIORITY_HIGH,
                      };
                      const colorStyles = {
                        low: 'peer-checked:border-slate-200 peer-checked:bg-slate-50 peer-checked:text-slate-600',
                        medium:
                          'peer-checked:border-amber-200 peer-checked:bg-amber-50 peer-checked:text-amber-700',
                        high: 'peer-checked:border-rose-200 peer-checked:bg-rose-50 peer-checked:text-rose-600',
                      };
                      return (
                        <label key={p} className="cursor-pointer">
                          <input
                            type="radio"
                            name="priority"
                            value={p}
                            checked={priority === p}
                            onChange={() => setPriority(p)}
                            className="peer sr-only"
                          />
                          <div
                            className={`mobile-touch-target rounded-full border-2 border-rose-100/50 py-2 text-center text-xs font-bold text-rose-300 transition-all hover:bg-rose-50/50 ${colorStyles[p]}`}
                          >
                            {labels[p]}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Due Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#6b5349] sm:text-sm">{FORM_TEXT.DUE_DATE_LABEL}</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mobile-touch-target w-full rounded-full border-2 border-rose-100 px-4 py-2 text-sm text-[#6b5349] outline-none transition-all focus:border-rose-300 focus:ring-4 focus:ring-rose-200/30"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#6b5349] sm:text-sm">{FORM_TEXT.TAGS_LABEL}</label>
                <div className="rounded-[1.35rem] border-2 border-rose-100 bg-gradient-to-br from-rose-50/60 via-white to-amber-50/40 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-all focus-within:border-rose-300 focus-within:ring-4 focus-within:ring-rose-200/20 sm:px-3.5 sm:py-3">
                  {/* 标签预览区域 */}
                  {tags.length > 0 && (
                    <div className="mb-2.5 flex flex-wrap gap-2 sm:mb-3">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="group inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white/90 px-3 py-1 text-xs font-semibold text-rose-500 shadow-sm transition-all hover:border-rose-300 hover:shadow-md"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-rose-400 transition-colors hover:bg-rose-100 hover:text-rose-600"
                            aria-label={`删除标签 ${tag}`}
                          >
                            <X className="h-3 w-3 stroke-[2.5]" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 输入框区域 */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      onBlur={handleAddTag}
                      placeholder={tags.length === 0 ? FORM_TEXT.TAGS_PLACEHOLDER : "继续输入标签..."}
                      className="min-w-0 flex-1 bg-transparent text-sm text-[#6b5349] outline-none placeholder:text-rose-300"
                    />
                    {tagInput.trim() && (
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="shrink-0 rounded-full bg-rose-400 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-rose-500 active:scale-95"
                      >
                        添加
                      </button>
                    )}
                  </div>

                  <p className="mt-2 text-[10px] text-rose-400 sm:text-[11px]">
                    {tags.length === 0 
                      ? "使用英文逗号分隔多个标签，或按回车键添加" 
                      : "按回车或逗号添加，退格键删除"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="shrink-0 border-t-2 border-rose-100 bg-white/95 px-4 py-3.5 shadow-[0_-12px_28px_rgba(244,190,196,0.14)] backdrop-blur-sm sm:px-6 sm:py-4">
            <div className="flex items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="mobile-touch-target cursor-pointer rounded-full border border-rose-200 px-4 py-2.5 text-sm font-bold text-[#6b5349] transition-colors hover:bg-rose-50/50 sm:px-5"
              >
                {FORM_TEXT.CANCEL_BUTTON}
              </button>
              <button
                type="submit"
                className="pink-primary-puffy mobile-touch-target flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold text-white cursor-pointer transition-all active:scale-95 sm:px-6"
              >
                <Save className="h-4 w-4 stroke-[2.5]" />
                <span>{FORM_TEXT.SAVE_BUTTON}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

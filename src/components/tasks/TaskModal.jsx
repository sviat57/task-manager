import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Tag, Flag, AlignLeft, Check, CheckCircle2 } from 'lucide-react';
import { AnimatePresence as AP } from 'framer-motion';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { SubtaskItem } from './SubtaskItem';
import { PRIORITIES, CATEGORIES } from '../../constants';
import { getSubtaskProgress, generateId } from '../../utils/helpers';

export function TaskModal({ task, onClose, onUpdate, onAddSubtask, onToggleSubtask, onDeleteSubtask }) {
  const [form, setForm] = useState({
    title:       task?.title       || '',
    description: task?.description || '',
    priority:    task?.priority    || 'medium',
    category:    task?.category    || 'work',
    deadline:    task?.deadline    || '',
  });
  const [newSubtask, setNewSubtask] = useState('');
  const titleRef = useRef(null);

  // Фокус на заголовок при открытии
  useEffect(() => { titleRef.current?.focus(); }, []);

  // Автосохранение формы при изменении
  useEffect(() => {
    if (!task) return;
    const timer = setTimeout(() => onUpdate(task.id, form), 400);
    return () => clearTimeout(timer);
  }, [form]);

  const progress = getSubtaskProgress(task?.subtasks);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    onAddSubtask(task.id, newSubtask.trim());
    setNewSubtask('');
  };

  return (
    // Оверлей
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Затемнение фона */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" />

      {/* Панель модалки */}
      <motion.div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl
          border border-slate-200/60 dark:border-slate-700/60 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{   opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
      >
        {/* Шапка */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-5 pb-4
          bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Детали задачи</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800
              text-slate-500 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Заголовок */}
          <div>
            <input
              ref={titleRef}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Название задачи..."
              className="w-full text-lg font-semibold bg-transparent outline-none
                text-slate-900 dark:text-slate-100 placeholder:text-slate-400
                dark:placeholder:text-slate-600"
            />
          </div>

          {/* Описание */}
          <div className="flex gap-3">
            <AlignLeft size={16} className="text-slate-400 mt-1 flex-shrink-0" />
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Добавьте описание..."
              rows={3}
              className="flex-1 text-sm bg-transparent outline-none resize-none
                text-slate-700 dark:text-slate-300 placeholder:text-slate-400
                dark:placeholder:text-slate-600"
            />
          </div>

          {/* Приоритет */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flag size={14} className="text-slate-400" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Приоритет
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(PRIORITIES).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => setForm(f => ({ ...f, priority: key }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                    border transition-all cursor-pointer
                    ${form.priority === key
                      ? `${p.bg} ${p.color} ${p.border}`
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                  {p.label}
                  {form.priority === key && <Check size={10} />}
                </button>
              ))}
            </div>
          </div>

          {/* Категория */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag size={14} className="text-slate-400" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Категория
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer
                    ${form.category === cat.id ? cat.light : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Дедлайн */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Дедлайн
              </span>
            </div>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200
                dark:border-slate-700 rounded-xl px-3 py-2 outline-none
                text-slate-700 dark:text-slate-300 cursor-pointer
                focus:ring-2 focus:ring-violet-500/30 transition-all"
            />
          </div>

          {/* Подзадачи */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Подзадачи
              </span>
              {task?.subtasks?.length > 0 && (
                <span className="text-xs text-slate-400">
                  {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                </span>
              )}
            </div>

            {task?.subtasks?.length > 0 && (
              <ProgressBar value={progress} className="mb-3" />
            )}

            <AnimatePresence>
              <div className="space-y-2 mb-3">
                {task?.subtasks?.map(subtask => (
                  <SubtaskItem
                    key={subtask.id}
                    subtask={subtask}
                    onToggle={() => onToggleSubtask(task.id, subtask.id)}
                    onDelete={() => onDeleteSubtask(task.id, subtask.id)}
                  />
                ))}
              </div>
            </AnimatePresence>

            {/* Поле добавления подзадачи */}
            <div className="flex gap-2">
              <input
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                placeholder="Добавить подзадачу..."
                className="flex-1 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200
                  dark:border-slate-700 rounded-xl px-3 py-2 outline-none
                  text-slate-700 dark:text-slate-300 placeholder:text-slate-400
                  focus:ring-2 focus:ring-violet-500/30 transition-all"
              />
              <Button variant="primary" onClick={handleAddSubtask}>
                <Plus size={14} />
              </Button>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5
                bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                text-white text-sm font-semibold
                rounded-xl transition-colors duration-150 cursor-pointer
                shadow-sm shadow-indigo-200 dark:shadow-indigo-900"
            >
              <CheckCircle2 size={16} />
              Готово
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Tag, Flag, AlignLeft, Check, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import { SubtaskItem } from './SubtaskItem';
import { PRIORITIES, CATEGORIES } from '../../constants';
import { getSubtaskProgress } from '../../utils/helpers';
import { toDatetimeLocalValue, fromDatetimeLocalValue } from '../../utils/deadlineHelpers';

export function TaskModal({
  task,
  mode = 'edit',
  onClose,
  onCancel,
  onDelete,
  onUpdate,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) {
  const isCreate = mode === 'create';

  const [form, setForm] = useState({
    title:       task?.title       || '',
    description: task?.description || '',
    priority:    task?.priority    || 'medium',
    category:    task?.category    || 'work',
    deadlineAt:  toDatetimeLocalValue(task?.deadline),
  });
  const [newSubtask, setNewSubtask] = useState('');
  const titleRef = useRef(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  useEffect(() => {
    if (!task) return;
    const deadline = fromDatetimeLocalValue(form.deadlineAt);
    const timer = setTimeout(() => onUpdate(task.id, {
      title:       form.title,
      description: form.description,
      priority:    form.priority,
      category:    form.category,
      deadline,
    }), 400);
    return () => clearTimeout(timer);
  }, [form]);

  const progress = getSubtaskProgress(task?.subtasks);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    onAddSubtask(task.id, newSubtask.trim());
    setNewSubtask('');
  };

  const handleCancel = () => {
    if (isCreate && onCancel) onCancel();
    else onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <motion.div
        className="relative w-full max-w-lg bg-theme-surface rounded-card
          shadow-modal border border-theme max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
      >
        <motion.div className="sticky top-0 z-10 flex items-center justify-between
          px-6 pt-5 pb-4 bg-theme-surface border-b border-theme">
          <h2 className="font-semibold text-theme-main">
            {isCreate ? 'Новая задача' : 'Детали задачи'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-theme-elevated
              text-theme-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </motion.div>

        <motion.div className="px-6 py-5 space-y-5">
          <input
            ref={titleRef}
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Название задачи..."
            className="w-full text-lg font-semibold bg-transparent outline-none
              text-theme-main placeholder:text-theme-muted"
            style={{ fontFamily: 'var(--font-main)' }}
          />

          <motion.div className="flex gap-3">
            <AlignLeft size={16} className="text-theme-muted mt-1 flex-shrink-0" />
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Добавьте описание..."
              rows={3}
              className="flex-1 text-sm bg-transparent outline-none resize-none
                text-theme-main placeholder:text-theme-muted"
              style={{ fontFamily: 'var(--font-main)' }}
            />
          </motion.div>

          <motion.div>
            <motion.div className="flex items-center gap-2 mb-2">
              <Flag size={14} className="text-theme-muted" />
              <span className="text-xs font-medium text-theme-muted uppercase tracking-wide">
                Приоритет
              </span>
            </motion.div>
            <motion.div className="flex gap-2 flex-wrap">
              {Object.entries(PRIORITIES).map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, priority: key }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                    text-xs font-medium border transition-all cursor-pointer
                    ${form.priority === key
                      ? `${p.bg} ${p.color} ${p.border}`
                      : 'border-theme text-theme-muted hover:bg-theme-elevated'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                  {p.label}
                  {form.priority === key && <Check size={10} />}
                </button>
              ))}
            </motion.div>
          </motion.div>

          <motion.div>
            <motion.div className="flex items-center gap-2 mb-2">
              <Tag size={14} className="text-theme-muted" />
              <span className="text-xs font-medium text-theme-muted uppercase tracking-wide">
                Категория
              </span>
            </motion.div>
            <motion.div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  className={`px-3 py-1 rounded-xl text-xs font-medium
                    transition-all cursor-pointer border
                    ${form.category === cat.id
                      ? `${cat.light} border-transparent`
                      : 'bg-theme-elevated text-theme-muted border-theme hover:bg-theme-base'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </motion.div>
          </motion.div>

          <motion.div>
            <motion.div className="flex items-center gap-2 mb-3">
              <Calendar size={14} className="text-theme-muted" />
              <span className="text-xs font-medium text-theme-muted uppercase tracking-wide">
                Дедлайн
              </span>
            </motion.div>
            <motion.div className="flex gap-2 items-end">
              <motion.div className="flex-1">
                <label className="block text-xs text-theme-muted mb-1.5">
                  Дата и время
                </label>
                <motion.div className="relative">
                  <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2
                    text-theme-muted pointer-events-none z-10" />
                  <input
                    type="datetime-local"
                    value={form.deadlineAt}
                    onChange={e => setForm(f => ({ ...f, deadlineAt: e.target.value }))}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-theme-elevated
                      border border-theme rounded-xl outline-none cursor-pointer
                      text-theme-main transition-all datetime-local-input"
                    style={{ fontFamily: 'var(--font-main)' }}
                  />
                </motion.div>
              </motion.div>
              {form.deadlineAt && (
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, deadlineAt: '' }))}
                  className="p-2 rounded-xl hover:bg-theme-elevated
                    text-theme-muted hover:text-theme-main
                    transition-colors cursor-pointer mb-0.5"
                  title="Убрать дедлайн"
                >
                  <X size={14} />
                </button>
              )}
            </motion.div>
            {form.deadlineAt && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-primary mt-2 flex items-center gap-1"
              >
                <Check size={11} />
                {new Date(fromDatetimeLocalValue(form.deadlineAt)).toLocaleString('ru', {
                  day: 'numeric', month: 'long',
                  hour: '2-digit', minute: '2-digit',
                })}
              </motion.p>
            )}
          </motion.div>

          <motion.div>
            <motion.div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-theme-muted uppercase tracking-wide">
                Подзадачи
              </span>
              {task?.subtasks?.length > 0 && (
                <span className="text-xs text-theme-muted">
                  {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                </span>
              )}
            </motion.div>

            {task?.subtasks?.length > 0 && (
              <ProgressBar value={progress} className="mb-3" />
            )}

            <AnimatePresence>
              <motion.div className="space-y-2 mb-3">
                {task?.subtasks?.map(subtask => (
                  <SubtaskItem
                    key={subtask.id}
                    subtask={subtask}
                    onToggle={() => onToggleSubtask(task.id, subtask.id)}
                    onDelete={() => onDeleteSubtask(task.id, subtask.id)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            <motion.div className="flex gap-2">
              <input
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                placeholder="Добавить подзадачу..."
                className="flex-1 text-sm bg-theme-elevated border border-theme
                  rounded-xl px-3 py-2 outline-none text-theme-main
                  placeholder:text-theme-muted transition-all"
                style={{ fontFamily: 'var(--font-main)' }}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="bg-primary hover:bg-primary-hover text-primary-fg
                  px-4 rounded-xl transition-colors cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </motion.div>
          </motion.div>

          <motion.div className="flex items-center justify-between gap-3 pt-4 border-t border-theme">
            {isCreate ? (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2.5
                  text-sm font-semibold rounded-xl
                  bg-theme-elevated hover:bg-theme-base text-theme-main
                  border border-theme transition-colors cursor-pointer"
              >
                Отмена
              </button>
            ) : (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-2 px-4 py-2.5
                  text-sm font-semibold rounded-xl
                  text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                  transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
                Удалить
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5 ml-auto
                bg-primary hover:bg-primary-hover
                text-primary-fg text-sm font-semibold rounded-xl
                transition-colors duration-150 cursor-pointer shadow-card"
            >
              <CheckCircle2 size={16} />
              Готово
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

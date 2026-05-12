import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Tag, Flag, AlignLeft, Check, CheckCircle2, Clock } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import { SubtaskItem } from './SubtaskItem';
import { PRIORITIES, CATEGORIES } from '../../constants';
import { getSubtaskProgress } from '../../utils/helpers';
 
export function TaskModal({
  task, onClose, onUpdate,
  onAddSubtask, onToggleSubtask, onDeleteSubtask,
}) {
  const [form, setForm] = useState({
    title:        task?.title       || '',
    description:  task?.description || '',
    priority:     task?.priority    || 'medium',
    category:     task?.category    || 'work',
    deadlineDate: task?.deadline ? task.deadline.slice(0, 10)  : '',
    deadlineTime: task?.deadline ? task.deadline.slice(11, 16) : '',
  });
  const [newSubtask, setNewSubtask] = useState('');
  const titleRef = useRef(null);
 
  useEffect(() => { titleRef.current?.focus(); }, []);
 
  useEffect(() => {
    if (!task) return;
    const deadline = form.deadlineDate
      ? `${form.deadlineDate}T${form.deadlineTime || '00:00'}`
      : '';
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
 
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{   opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
 
      <motion.div
        className="relative w-full max-w-lg bg-theme-surface rounded-card
          shadow-modal border border-theme max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{   opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
      >
        {/* Шапка */}
        <div className="sticky top-0 z-10 flex items-center justify-between
          px-6 pt-5 pb-4 bg-theme-surface border-b border-theme">
          <h2 className="font-semibold text-theme-main">Детали задачи</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-theme-elevated
              text-theme-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
 
        <div className="px-6 py-5 space-y-5">
 
          {/* Заголовок */}
          <input
            ref={titleRef}
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Название задачи..."
            className="w-full text-lg font-semibold bg-transparent outline-none
              text-theme-main placeholder:text-theme-muted"
            style={{ fontFamily: 'var(--font-main)' }}
          />
 
          {/* Описание */}
          <div className="flex gap-3">
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
          </div>
 
          {/* Приоритет */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flag size={14} className="text-theme-muted" />
              <span className="text-xs font-medium text-theme-muted uppercase tracking-wide">
                Приоритет
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(PRIORITIES).map(([key, p]) => (
                <button
                  key={key}
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
            </div>
          </div>
 
          {/* Категория */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag size={14} className="text-theme-muted" />
              <span className="text-xs font-medium text-theme-muted uppercase tracking-wide">
                Категория
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
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
            </div>
          </div>
 
          {/* Дедлайн */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={14} className="text-theme-muted" />
              <span className="text-xs font-medium text-theme-muted uppercase tracking-wide">
                Дедлайн
              </span>
            </div>
            <div className="flex gap-3">
 
              {/* Дата */}
              <div className="flex-1">
                <label className="block text-xs text-theme-muted mb-1.5">Дата</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2
                    text-theme-muted pointer-events-none" />
                  <input
                    type="date"
                    value={form.deadlineDate}
                    onChange={e => setForm(f => ({ ...f, deadlineDate: e.target.value }))}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-theme-elevated
                      border border-theme rounded-xl outline-none cursor-pointer
                      text-theme-main transition-all"
                    style={{ colorScheme: 'var(--color-text) === "#f1f5f9" ? "dark" : "light"', fontFamily: 'var(--font-main)' }}
                  />
                </div>
              </div>
 
              {/* Время */}
              <div className="w-32">
                <label className="block text-xs text-theme-muted mb-1.5">Время</label>
                <div className="relative">
                  <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2
                    text-theme-muted pointer-events-none" />
                  <input
                    type="time"
                    value={form.deadlineTime}
                    onChange={e => setForm(f => ({ ...f, deadlineTime: e.target.value }))}
                    disabled={!form.deadlineDate}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-theme-elevated
                      border border-theme rounded-xl outline-none cursor-pointer
                      text-theme-main disabled:opacity-40 disabled:cursor-not-allowed
                      transition-all"
                    style={{ fontFamily: 'var(--font-main)' }}
                  />
                </div>
              </div>
 
              {/* Сброс */}
              {form.deadlineDate && (
                <div className="flex items-end pb-0.5">
                  <button
                    onClick={() => setForm(f => ({ ...f, deadlineDate: '', deadlineTime: '' }))}
                    className="p-2 rounded-xl hover:bg-theme-elevated
                      text-theme-muted hover:text-theme-main
                      transition-colors cursor-pointer"
                    title="Убрать дедлайн"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
 
            {/* Превью даты */}
            {form.deadlineDate && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1,  y:  0 }}
                className="text-xs text-primary mt-2 flex items-center gap-1"
              >
                <Check size={11} />
                {new Date(`${form.deadlineDate}T${form.deadlineTime || '00:00'}`)
                  .toLocaleString('ru', {
                    day: 'numeric', month: 'long',
                    hour: '2-digit', minute: '2-digit',
                  })
                }
              </motion.p>
            )}
          </div>
 
          {/* Подзадачи */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-theme-muted uppercase tracking-wide">
                Подзадачи
              </span>
              {task?.subtasks?.length > 0 && (
                <span className="text-xs text-theme-muted">
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
 
            {/* Добавить подзадачу */}
            <div className="flex gap-2">
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
                onClick={handleAddSubtask}
                className="bg-primary hover:bg-primary-hover text-primary-fg
                  px-4 rounded-xl transition-colors cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
 
          {/* Кнопка Готово */}
          <div className="flex justify-end pt-4 border-t border-theme">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5
                bg-primary hover:bg-primary-hover
                text-primary-fg text-sm font-semibold rounded-xl
                transition-colors duration-150 cursor-pointer shadow-card"
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

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, ChevronRight, Clock, SlidersHorizontal } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { PRIORITIES, CATEGORIES } from '../../constants';
import {
  getTasksForDay,
  formatDayPanelTitle,
  formatTaskDeadlineTime,
} from '../../utils/deadlineHelpers';
import { getSubtaskProgress, getCategoryById } from '../../utils/helpers';

const STATUS_FILTERS = [
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
  { value: 'all', label: 'Все' },
];

export function DayTaskPanel({
  date,
  tasks,
  onClose,
  onAddTask,
  onOpenTask,
  onToggle,
  onDelete,
  onToggleSubtask,
}) {
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');
  const [showFilters, setShowFilters] = useState(false);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const dayTasks = useMemo(() => getTasksForDay(tasks, date), [tasks, date]);

  const filtered = useMemo(() => {
    return dayTasks.filter((t) => {
      if (filterStatus === 'active' && t.completed) return false;
      if (filterStatus === 'completed' && !t.completed) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      return true;
    });
  }, [dayTasks, filterPriority, filterCategory, filterStatus]);

  const title = formatDayPanelTitle(date);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - (touchStartY.current ?? 0));
    if (dx > 72 && dy < 60) onClose();
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <motion.div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.aside
        className="day-task-panel relative w-full md:max-w-[420px] h-full
          bg-theme-surface shadow-modal border-l border-theme flex flex-col overflow-hidden"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <header
          className="flex-shrink-0 px-4 sm:px-5 pb-3 border-b border-theme"
          style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-theme-main leading-snug capitalize">{title}</h2>
              <p className="text-xs text-theme-muted mt-0.5">
                {filtered.length} из {dayTasks.length} задач
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-theme-elevated text-theme-muted cursor-pointer"
              aria-label="Закрыть"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onAddTask}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2
                rounded-xl text-sm font-semibold bg-primary hover:bg-primary-hover
                text-primary-fg cursor-pointer shadow-card"
            >
              <Plus size={15} />
              Добавить задачу
            </button>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`inline-flex items-center px-3 py-2 rounded-xl text-sm border cursor-pointer
                ${showFilters
                  ? 'bg-primary text-primary-fg border-primary'
                  : 'bg-theme-elevated text-theme-muted border-theme'
                }`}
            >
              <SlidersHorizontal size={15} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-xs bg-theme-elevated border border-theme rounded-lg px-2 py-1.5 flex-1 min-w-[100px]"
                  >
                    {STATUS_FILTERS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="text-xs bg-theme-elevated border border-theme rounded-lg px-2 py-1.5 flex-1 min-w-[100px]"
                  >
                    <option value="all">Все приоритеты</option>
                    {Object.entries(PRIORITIES).map(([k, p]) => (
                      <option key={k} value={k}>{p.label}</option>
                    ))}
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="text-xs bg-theme-elevated border border-theme rounded-lg px-2 py-1.5 flex-1 min-w-[100px]"
                  >
                    <option value="all">Все категории</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
          {dayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-theme-muted mb-6">На этот день задач пока нет</p>
              <button
                type="button"
                onClick={onAddTask}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary
                  hover:bg-primary-hover text-primary-fg text-sm font-semibold cursor-pointer shadow-card"
              >
                <Plus size={16} />
                Добавить задачу
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-theme-muted py-12">Нет задач по выбранным фильтрам</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((task) => (
                <DayTaskItem
                  key={task.id}
                  task={task}
                  onOpen={() => onOpenTask(task)}
                  onToggle={() => onToggle(task.id)}
                  onDelete={() => onDelete(task.id)}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}
            </div>
          )}
        </div>

        <p className="md:hidden text-center text-[10px] text-theme-muted py-2 border-t border-theme">
          Свайп вправо → закрыть
        </p>
      </motion.aside>
    </div>
  );
}

function DayTaskItem({ task, onOpen, onToggle, onDelete, onToggleSubtask }) {
  const [expanded, setExpanded] = useState(false);
  const priority = PRIORITIES[task.priority];
  const category = getCategoryById(CATEGORIES, task.category);
  const progress = getSubtaskProgress(task.subtasks);
  const hasSubtasks = task.subtasks?.length > 0;
  const time = formatTaskDeadlineTime(task.deadline);
  const stop = (fn) => (e) => { e.stopPropagation(); fn?.(e); };

  return (
    <div className={`relative bg-theme-surface border border-theme rounded-card shadow-card
      ${task.completed ? 'opacity-65' : 'hover:shadow-card-hover'}`}>
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${priority?.dot}`} />

      <div className="flex items-start gap-3 p-3 pl-4 cursor-pointer" onClick={onOpen}>
        <button
          type="button"
          onClick={stop(onToggle)}
          style={{ width: 20, height: 20, minWidth: 20, minHeight: 20 }}
          className={`flex-shrink-0 mt-0.5 rounded-full border-2 flex items-center justify-center cursor-pointer
            ${task.completed ? 'bg-primary border-primary' : 'border-theme hover:border-primary'}`}
        >
          {task.completed && (
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
              <path d="M2 6l3 3 5-5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: 'var(--color-primary-fg)' }} />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${task.completed ? 'line-through text-theme-muted' : 'text-theme-main'}`}>
            {task.title || <span className="italic text-theme-muted">Без названия</span>}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {time && (
              <span className="flex items-center gap-1 text-xs text-theme-muted">
                <Clock size={10} />{time}
              </span>
            )}
            {category && <Badge className={category.light}>{category.label}</Badge>}
          </div>
          {hasSubtasks && (
            <div className="mt-2">
              <div className="flex justify-between mb-1 text-xs text-theme-muted">
                <span>{task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1" onClick={stop()}>
          <button type="button" onClick={stop(onDelete)}
            className="p-1.5 rounded-lg text-theme-muted hover:text-red-500 cursor-pointer">
            <Trash2 size={14} />
          </button>
          {hasSubtasks && (
            <button type="button" onClick={stop(() => setExpanded((v) => !v))}
              className="p-1.5 rounded-lg hover:bg-theme-elevated text-theme-muted cursor-pointer">
              <ChevronRight size={14} className={expanded ? 'rotate-90' : ''} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && hasSubtasks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-theme mx-3 mb-3 pt-2"
            onClick={stop()}
          >
            <div className="space-y-2 pl-9">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleSubtask?.(task.id, subtask.id)}
                    style={{ width: 14, height: 14, minWidth: 14, minHeight: 14 }}
                    className={`rounded-full border-2 flex items-center justify-center cursor-pointer
                      ${subtask.completed ? 'bg-primary border-primary' : 'border-theme hover:border-primary'}`}
                  >
                    {subtask.completed && (
                      <svg viewBox="0 0 12 12" fill="none" className="w-full h-full p-px">
                        <path d="M2 6l3 3 5-5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                          style={{ stroke: 'var(--color-primary-fg)' }} />
                      </svg>
                    )}
                  </button>
                  <span className={`text-xs ${subtask.completed ? 'line-through text-theme-muted' : 'text-theme-main'}`}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, ChevronRight, Clock,
  Flag, Tag, CheckCircle2, Pencil, X, Calendar
} from 'lucide-react';
import { Badge }       from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { PRIORITIES, CATEGORIES } from '../../constants';
import {
  formatDeadline,
  getSubtaskProgress, getCategoryById
} from '../../utils/helpers';
import { getDeadlineUrgency } from '../../utils/deadlineHelpers';
 
export function TaskItem({
  task,
  onToggle,
  onDelete,
  onOpen,
  onToggleSubtask,
  isGrid = false,
}) {
  const [hovered,   setHovered]   = useState(false);
  const [expanded,  setExpanded]  = useState(false);
  const [slideOver, setSlideOver] = useState(false);
 
  const priority    = PRIORITIES[task.priority];
  const category    = getCategoryById(CATEGORIES, task.category);
  const progress    = getSubtaskProgress(task.subtasks);
  const urgency     = getDeadlineUrgency(task.deadline, task.completed);
  const deadline    = formatDeadline(task.deadline);
  const hasSubtasks = task.subtasks?.length > 0;

  const urgencyCardClass = {
    overdue:  'bg-theme-elevated border-theme opacity-80',
    critical: 'border-red-400/80 bg-red-50/60 dark:bg-red-950/25 deadline-pulse',
    urgent:   'border-orange-400/80 bg-orange-50/60 dark:bg-orange-950/25',
    warning:  'border-amber-400/70 bg-amber-50/50 dark:bg-amber-950/20',
    normal:   '',
    none:     '',
  }[urgency];

  const urgencyDeadlineClass = {
    overdue:  'text-theme-muted',
    critical: 'text-red-600 dark:text-red-400 font-semibold',
    urgent:   'text-orange-600 dark:text-orange-400 font-semibold',
    warning:  'text-amber-600 dark:text-amber-400 font-medium',
    normal:   'text-theme-muted',
    none:     'text-theme-muted',
  }[urgency];
 
  const handleCardClick = () => setSlideOver(true);
  const stop = (fn) => (e) => { e.stopPropagation(); fn?.(e); };
 
  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0  }}
        exit={{   opacity: 0, x: -20, transition: { duration: 0.2 } }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={()   => setHovered(false)}
        onClick={handleCardClick}
        className={`
          group relative cursor-pointer select-none
          bg-theme-surface border border-theme rounded-card
          transition-all duration-200 shadow-card
          ${urgencyCardClass}
          ${task.completed
            ? 'opacity-60'
            : 'hover:shadow-card-hover hover:bg-theme-elevated'
          }
          ${isGrid ? 'p-4 flex flex-col gap-3' : 'p-4'}
        `}
      >
        {/* Полоска приоритета */}
        <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${priority?.dot}`} />
 
        <div className={`flex items-start gap-3 ml-2 ${isGrid ? 'flex-1' : ''}`}>
 
          {/* Чекбокс */}
          <button
            onClick={stop(() => onToggle(task.id))}
            style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px' }}
            className={`
              flex-shrink-0 mt-0.5 rounded-full border-2
              transition-all duration-300 flex items-center justify-center cursor-pointer
              ${task.completed
                ? 'bg-primary border-primary'
                : 'border-theme hover:border-primary'
              }
            `}
          >
            {task.completed && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                viewBox="0 0 12 12" fill="none" className="w-3 h-3"
              >
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="text-primary-fg" style={{ color: 'var(--color-primary-fg)' }}/>
              </motion.svg>
            )}
          </button>
 
          {/* Текст */}
          <div className="flex-1 min-w-0">
            <p className={`
              font-medium text-sm leading-snug transition-all duration-300
              ${task.completed || urgency === 'overdue'
                ? 'line-through text-theme-muted'
                : 'text-theme-main'}
            `}>
              {task.title || (
                <span className="text-theme-muted italic">Без названия</span>
              )}
            </p>
 
            {task.description && (
              <p className={`text-xs text-theme-muted mt-0.5
                ${isGrid ? 'line-clamp-2' : 'truncate'}`}>
                {task.description}
              </p>
            )}
 
            {/* Категория + Дедлайн */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {category && (
                <Badge className={category.light}>{category.label}</Badge>
              )}
              {deadline && (
                <span className={`flex items-center gap-1 text-xs flex-wrap ${urgencyDeadlineClass}`}>
                  <Clock size={10} />
                  {deadline}
                  {urgency === 'urgent' && (
                    <span className="font-bold uppercase tracking-wide">3 часа</span>
                  )}
                  {urgency === 'overdue' && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-theme-base text-theme-muted normal-case">
                      Дедлайн истёк
                    </span>
                  )}
                </span>
              )}
            </div>
 
            {/* Прогресс подзадач */}
            {hasSubtasks && (
              <div className="mt-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-theme-muted">
                    {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} подзадач
                  </span>
                  <span className="text-xs text-theme-muted">{progress}%</span>
                </div>
                <ProgressBar value={progress} />
              </div>
            )}
          </div>
 
          {/* Кнопки справа — на тач-устройствах всегда видны */}
          <div
            className="flex items-center gap-1 flex-shrink-0 self-start
              transition-opacity duration-150"
            style={{
              opacity: hovered ? 1 : undefined,
            }}
            data-actions
            onClick={stop()}
          >
            <button
              onClick={stop(() => onDelete(task.id))}
              className="p-1.5 rounded-lg text-theme-muted
                hover:text-red-500 hover:bg-theme-elevated
                transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
 
            {!isGrid && hasSubtasks && (
              <button
                onClick={stop(() => setExpanded(v => !v))}
                className="p-1.5 rounded-lg hover:bg-theme-elevated
                  text-theme-muted transition-colors cursor-pointer"
              >
                <motion.div
                  animate={{ rotate: expanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={16} />
                </motion.div>
              </button>
            )}
          </div>
        </div>
 
        {/* Инлайн-подзадачи List */}
        <AnimatePresence initial={false}>
          {!isGrid && expanded && hasSubtasks && (
            <motion.div
              key="subtasks-inline"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{   opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="ml-10 mt-3 space-y-2 border-t border-theme pt-3">
                {task.subtasks.map(subtask => (
                  <InlineSubtask
                    key={subtask.id}
                    subtask={subtask}
                    onToggle={stop(() => onToggleSubtask?.(task.id, subtask.id))}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
 
        {/* Подзадачи Grid */}
        {isGrid && hasSubtasks && (
          <div className="ml-2 space-y-1.5 border-t border-theme pt-3"
            onClick={stop()}>
            {task.subtasks.slice(0, 3).map(subtask => (
              <InlineSubtask
                key={subtask.id}
                subtask={subtask}
                onToggle={stop(() => onToggleSubtask?.(task.id, subtask.id))}
              />
            ))}
            {task.subtasks.length > 3 && (
              <p className="text-xs text-theme-muted pl-6">
                +{task.subtasks.length - 3} ещё...
              </p>
            )}
          </div>
        )}
      </motion.div>
 
      {/* SlideOver */}
      <AnimatePresence>
        {slideOver && (
          <TaskSlideOver
            task={task}
            priority={priority}
            category={category}
            deadline={deadline}
            urgency={urgency}
            progress={progress}
            onClose={() => setSlideOver(false)}
            onEdit={() => { setSlideOver(false); onOpen(task); }}
            onToggle={() => { onToggle(task.id); setSlideOver(false); }}
            onToggleSubtask={onToggleSubtask}
          />
        )}
      </AnimatePresence>
    </>
  );
}
 
/* ── InlineSubtask ───────────────────────────────────────────────────────── */
function InlineSubtask({ subtask, onToggle }) {
  return (
    <motion.div layout className="flex items-center gap-2">
      <button
        onClick={onToggle}
        style={{ width: '14px', height: '14px', minWidth: '14px', minHeight: '14px' }}
        className={`
          flex-shrink-0 rounded border-2
          transition-all duration-200 cursor-pointer
          flex items-center justify-center
          ${subtask.completed
            ? 'bg-primary border-primary'
            : 'border-theme hover:border-primary'
          }
        `}
      >
        {subtask.completed && (
          <svg viewBox="0 0 12 12" fill="none" className="w-full h-full p-px">
            <path d="M2 6l3 3 5-5" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ stroke: 'var(--color-primary-fg)' }}/>
          </svg>
        )}
      </button>
      <span className={`text-xs select-none transition-all duration-200
        ${subtask.completed ? 'line-through text-theme-muted' : 'text-theme-main'}`}>
        {subtask.title}
      </span>
    </motion.div>
  );
}
 
/* ── TaskSlideOver ───────────────────────────────────────────────────────── */
function TaskSlideOver({
  task, priority, category, deadline, urgency, progress,
  onClose, onEdit, onToggle, onToggleSubtask,
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{   opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
 
      <motion.div
        className="relative w-full max-w-md h-full bg-theme-surface
          shadow-modal flex flex-col overflow-hidden"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{   x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        {/* Шапка */}
        <div className="flex items-center justify-between px-6 pb-4
          border-b border-theme flex-shrink-0"
          style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${priority?.dot}`} />
            <span className={`text-xs font-semibold ${priority?.color}`}>
              {priority?.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-theme-elevated
              text-theme-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
 
        {/* Контент */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
 
          {/* Заголовок */}
          <div>
            <h2 className={`text-xl font-bold leading-snug
              ${task.completed ? 'line-through text-theme-muted' : 'text-theme-main'}`}>
              {task.title || <span className="italic text-theme-muted">Без названия</span>}
            </h2>
            {task.completed && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium
                text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30
                px-2 py-1 rounded-full">
                <CheckCircle2 size={11} />
                Выполнено
              </span>
            )}
          </div>
 
          {/* Описание */}
          {task.description && (
            <div className="bg-theme-elevated rounded-xl p-4">
              <p className="text-sm text-theme-muted leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}
 
          {/* Мета-блоки */}
          <div className="grid grid-cols-2 gap-3">
            {deadline && (
              <MetaBlock
                icon={<Calendar size={14} />}
                label="Дедлайн"
                value={deadline}
                accent={urgency === 'overdue' ? 'text-theme-muted line-through' : 'text-theme-main'}
                bg={urgency === 'overdue'
                  ? 'bg-theme-elevated border-theme'
                  : 'bg-theme-elevated border-theme'
                }
              />
            )}
            {category && (
              <MetaBlock
                icon={<Tag size={14} />}
                label="Категория"
                value={category.label}
                accent="text-theme-main"
                bg="bg-theme-elevated border-theme"
              />
            )}
            <MetaBlock
              icon={<Flag size={14} />}
              label="Приоритет"
              value={priority?.label}
              accent={priority?.color}
              bg={`${priority?.bg} ${priority?.border}`}
            />
          </div>
 
          {/* Подзадачи */}
          {task.subtasks?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-theme-main">Подзадачи</span>
                <span className="text-xs text-theme-muted">
                  {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                </span>
              </div>
              <ProgressBar value={progress} className="mb-3" />
              <div className="space-y-2.5">
                {task.subtasks.map(subtask => (
                  <motion.div key={subtask.id} layout className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleSubtask?.(task.id, subtask.id)}
                      className={`
                        flex-shrink-0 w-4 h-4 rounded border-2
                        transition-all duration-200 cursor-pointer
                        flex items-center justify-center
                        ${subtask.completed
                          ? 'bg-primary border-primary'
                          : 'border-theme hover:border-primary'
                        }
                      `}
                    >
                      {subtask.completed && (
                        <svg viewBox="0 0 12 12" fill="none" className="w-full h-full p-0.5">
                          <path d="M2 6l3 3 5-5" strokeWidth="2.2"
                            strokeLinecap="round" strokeLinejoin="round"
                            style={{ stroke: 'var(--color-primary-fg)' }}/>
                        </svg>
                      )}
                    </button>
                    <span className={`text-sm transition-all duration-200
                      ${subtask.completed
                        ? 'line-through text-theme-muted'
                        : 'text-theme-main'
                      }`}>
                      {subtask.title}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
 
        {/* Кнопки снизу */}
        <div className="flex-shrink-0 flex gap-3 px-6 py-5 border-t border-theme safe-bottom">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 py-3
              bg-theme-elevated hover:bg-theme-base
              text-theme-main text-sm font-semibold rounded-card
              transition-colors duration-150 cursor-pointer border border-theme"
          >
            <Pencil size={15} />
            Изменить
          </button>
          <button
            onClick={onToggle}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3
              text-sm font-semibold rounded-card
              transition-colors duration-150 cursor-pointer
              ${task.completed
                ? 'bg-theme-elevated hover:bg-theme-base text-theme-muted border border-theme'
                : 'bg-primary hover:bg-primary-hover text-primary-fg shadow-card'
              }
            `}
          >
            <CheckCircle2 size={15} />
            {task.completed ? 'Вернуть' : 'Выполнено'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
 
/* ── MetaBlock ───────────────────────────────────────────────────────────── */
function MetaBlock({ icon, label, value, accent, bg }) {
  return (
    <div className={`rounded-xl border p-3 ${bg}`}>
      <div className="flex items-center gap-1.5 text-theme-muted mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-sm font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

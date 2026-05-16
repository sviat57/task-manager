import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Flame, Plus, Clock } from 'lucide-react';
import {
  getTodayTasks,
  getHighlightTodayTaskId,
  formatDeadlineCountdown,
  getDeadlineUrgency,
} from '../../utils/deadlineHelpers';
import { PRIORITIES } from '../../constants';

/**
 * «Задачи на сегодня» — все задачи с дедлайном на текущий день.
 * Самая срочная / просроченная выделяется огнём и красной рамкой.
 */
export function TodayTasksSection({ tasks, onOpen, onToggle, onAddTask, compact = false }) {
  const todayTasks = useMemo(
    () => getTodayTasks(tasks, { includeCompleted: false }),
    [tasks]
  );
  const highlightId = useMemo(() => getHighlightTodayTaskId(tasks), [tasks]);

  if (todayTasks.length === 0) {
    return (
      <div
        className={`rounded-card border border-dashed border-theme bg-theme-surface
          ${compact ? 'px-3 py-3' : 'px-4 py-5'} shadow-card`}
      >
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center gap-3"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CalendarDays size={18} className="text-theme-muted flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-theme-main">Задачи на сегодня</p>
              <p className="text-xs text-theme-muted mt-0.5">Нет задач на сегодня</p>
            </div>
          </div>
          {onAddTask && (
            <button
              type="button"
              onClick={onAddTask}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2
                rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover
                text-primary-fg transition-colors cursor-pointer shadow-card flex-shrink-0"
            >
              <Plus size={14} />
              Создать
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <section
      className={`rounded-card border border-theme bg-theme-surface shadow-card
        ${compact ? 'p-3' : 'p-4'} space-y-2`}
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-1"
      >
        <CalendarDays size={16} className="text-primary flex-shrink-0" />
        <h3 className="text-sm font-bold text-theme-main">Задачи на сегодня</h3>
        <span className="text-xs text-theme-muted ml-auto">{todayTasks.length}</span>
      </motion.div>

      <div className={`space-y-2 ${compact ? 'max-h-48' : 'max-h-64'} overflow-y-auto`}>
        {todayTasks.map((task) => (
          <TodayTaskRow
            key={task.id}
            task={task}
            isHighlight={task.id === highlightId}
            onOpen={onOpen}
            onToggle={onToggle}
            compact={compact}
          />
        ))}
      </div>
    </section>
  );
}

function TodayTaskRow({ task, isHighlight, onOpen, onToggle, compact }) {
  const priority = PRIORITIES[task.priority];
  const urgency = getDeadlineUrgency(task.deadline, task.completed);
  const countdown = formatDeadlineCountdown(task.deadline);
  const isOverdue = urgency === 'overdue' || urgency === 'critical';

  return (
    <motion.div
      role="button"
      tabIndex={0}
      layout
      onClick={() => onOpen?.(task)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen?.(task);
        }
      }}
      className={`
        cursor-pointer
        w-full flex items-center gap-2.5 text-left rounded-xl border p-2.5
        transition-all duration-200
        ${isHighlight
          ? 'border-red-400/80 bg-red-50/70 dark:bg-red-950/30 shadow-card deadline-pulse'
          : 'border-theme bg-theme-elevated hover:bg-theme-base'
        }
        ${compact ? 'text-xs' : 'text-sm'}
      `}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.(task.id);
        }}
        className={`
          flex-shrink-0 rounded-full border-2 flex items-center justify-center
          transition-colors cursor-pointer
          ${task.completed
            ? 'bg-primary border-primary'
            : 'border-theme hover:border-primary'
          }
        `}
        style={{ width: compact ? 16 : 18, height: compact ? 16 : 18, minWidth: compact ? 16 : 18 }}
      />

      {isHighlight && (
        <Flame
          size={compact ? 14 : 16}
          className="text-red-500 flex-shrink-0"
          aria-hidden
        />
      )}

      <span className={`w-0.5 self-stretch rounded-full flex-shrink-0 ${priority?.dot}`} />

      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold truncate
            ${isHighlight ? 'text-red-700 dark:text-red-300' : 'text-theme-main'}
            ${task.completed ? 'line-through text-theme-muted' : ''}`}
        >
          {task.title || 'Без названия'}
        </p>
        {countdown && (
          <span
            className={`flex items-center gap-1 text-[11px] mt-0.5
              ${isOverdue || isHighlight
                ? 'text-red-600 dark:text-red-400 font-semibold'
                : 'text-theme-muted'
              }`}
          >
            <Clock size={10} />
            {countdown}
          </span>
        )}
      </div>
    </motion.div>
  );
}

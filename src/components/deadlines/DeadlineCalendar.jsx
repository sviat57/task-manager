import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayTaskPanel } from './DayTaskPanel';
import { ChevronLeft, ChevronRight, Flame, Clock } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  getTodayFocusTask,
  getMonthGrid,
  groupTasksByCalendarDay,
  dayKey,
  getDeadlineUrgency,
} from '../../utils/deadlineHelpers';
import { formatDeadline } from '../../utils/helpers';
import { PRIORITIES } from '../../constants';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MAX_TASKS_DESKTOP = 3;

function capitalizeMonth(label) {
  if (!label) return label;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Календарь дедлайнов — month view (сетка 7×N). */
export function DeadlineCalendar({
  tasks,
  onOpen,
  onAddTaskForDay,
  onToggle,
  onDelete,
  onToggleSubtask,
}) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const focus = useMemo(() => getTodayFocusTask(tasks), [tasks]);
  const monthDays = useMemo(() => getMonthGrid(viewDate), [viewDate]);
  const tasksByDay = useMemo(() => groupTasksByCalendarDay(tasks), [tasks]);

  const monthTitle = capitalizeMonth(
    format(viewDate, 'LLLL yyyy', { locale: ru })
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto space-y-4"
    >
      <FocusStrip task={focus} onOpen={onOpen} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <NavButton
            aria-label="Предыдущий месяц"
            onClick={() => setViewDate((d) => subMonths(d, 1))}
          >
            <ChevronLeft size={18} />
          </NavButton>
          <NavButton
            aria-label="Следующий месяц"
            onClick={() => setViewDate((d) => addMonths(d, 1))}
          >
            <ChevronRight size={18} />
          </NavButton>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-theme-main order-first sm:order-none w-full sm:w-auto text-center sm:flex-1">
          {monthTitle}
        </h2>

        <button
          type="button"
          onClick={() => setViewDate(new Date())}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl
            bg-theme-elevated border border-theme text-theme-main
            hover:bg-theme-surface transition-colors cursor-pointer shadow-card"
        >
          Сегодня
        </button>
      </div>

      <div className="rounded-card border border-theme bg-theme-surface shadow-card overflow-hidden">
        <div className="calendar-month-grid border-b border-theme bg-theme-elevated">
          {WEEKDAYS.map((label) => (
            <div
              key={label}
              className="py-2 text-center text-[10px] sm:text-xs font-semibold text-theme-muted uppercase tracking-wide"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="calendar-month-grid calendar-month-body">
          {monthDays.map((day) => (
            <DayCell
              key={dayKey(day.date)}
              day={day}
              tasks={tasksByDay.get(dayKey(day.date)) || []}
              onOpenDay={setSelectedDay}
              onOpenTask={onOpen}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedDay && (
          <DayTaskPanel
            date={selectedDay}
            tasks={tasks}
            onClose={() => setSelectedDay(null)}
            onAddTask={() => onAddTaskForDay(selectedDay)}
            onOpenTask={onOpen}
            onToggle={onToggle}
            onDelete={onDelete}
            onToggleSubtask={onToggleSubtask}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NavButton({ children, onClick, ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded-xl border border-theme bg-theme-surface
        text-theme-muted hover:text-theme-main hover:bg-theme-elevated
        transition-colors cursor-pointer shadow-card"
      {...props}
    >
      {children}
    </button>
  );
}

function FocusStrip({ task, onOpen }) {
  if (!task) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-card border border-theme
        bg-theme-surface text-xs text-theme-muted shadow-card">
        <Flame size={14} className="text-amber-500 flex-shrink-0" />
        <span>Фокус дня: нет задач с дедлайном на сегодня</span>
      </div>
    );
  }

  const priority = PRIORITIES[task.priority];
  const deadline = formatDeadline(task.deadline);

  return (
    <button
      type="button"
      onClick={() => onOpen(task)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-card
        border border-amber-300/60 dark:border-amber-700/50
        bg-gradient-to-r from-amber-50/90 to-theme-surface
        dark:from-amber-950/30 dark:to-theme-surface
        hover:shadow-card-hover transition-all cursor-pointer text-left shadow-card"
    >
      <Flame size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
      <span className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wide flex-shrink-0 hidden sm:inline">
        Фокус дня
      </span>
      <span className={`w-0.5 h-4 rounded-full flex-shrink-0 ${priority?.dot}`} />
      <span className="flex-1 min-w-0 text-sm font-semibold text-theme-main truncate">
        {task.title || 'Без названия'}
      </span>
      {deadline && (
        <span className="flex items-center gap-1 text-xs text-theme-muted flex-shrink-0">
          <Clock size={11} />
          <span className="hidden sm:inline">{deadline}</span>
        </span>
      )}
    </button>
  );
}

function DayCell({ day, tasks: dayTasks, onOpenDay, onOpenTask }) {
  const { date, inMonth, isToday: today } = day;
  const extra = Math.max(0, dayTasks.length - MAX_TASKS_DESKTOP);
  const visible = dayTasks.slice(0, MAX_TASKS_DESKTOP);

  const handleCellClick = () => onOpenDay(date);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCellClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCellClick();
        }
      }}
      className={`
        calendar-day-cell group relative flex flex-col
        border-r border-b border-theme p-1 sm:p-1.5
        text-left cursor-pointer transition-colors duration-150
        hover:bg-theme-elevated/80
        ${inMonth ? 'bg-theme-surface' : 'bg-theme-base/60 opacity-70'}
        ${today
          ? 'ring-2 ring-inset ring-primary/35 bg-primary/[0.06] dark:bg-primary/10'
          : ''
        }
      `}
    >
      <span
        className={`
          text-[11px] sm:text-xs font-semibold leading-none mb-1 px-0.5
          ${inMonth ? 'text-theme-main' : 'text-theme-muted'}
          ${today ? 'text-primary' : ''}
        `}
      >
        {format(date, 'd')}
      </span>

      <div className="flex flex-wrap gap-0.5 md:hidden min-h-[14px]">
        {dayTasks.slice(0, 5).map((task) => (
          <button
            key={task.id}
            type="button"
            data-task
            title={task.title || 'Без названия'}
            onClick={(e) => {
              e.stopPropagation();
              onOpenTask(task);
            }}
            className={`w-2 h-2 rounded-full flex-shrink-0 cursor-pointer
              ${PRIORITIES[task.priority]?.dot || 'bg-theme-muted'}
              hover:scale-125 transition-transform`}
          />
        ))}
        {dayTasks.length > 5 && (
          <span className="text-[9px] text-theme-muted leading-none">
            +{dayTasks.length - 5}
          </span>
        )}
      </div>

      <div className="hidden md:flex flex-col gap-0.5 flex-1 min-h-0 overflow-hidden">
        {visible.map((task) => (
          <CalendarMiniTask key={task.id} task={task} onOpen={onOpenTask} />
        ))}
        {extra > 0 && (
          <span
            className="text-[10px] text-theme-muted px-1 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            +{extra} ещё
          </span>
        )}
      </div>
    </div>
  );
}

function CalendarMiniTask({ task, onOpen }) {
  const priority = PRIORITIES[task.priority];
  const overdue = getDeadlineUrgency(task.deadline, task.completed) === 'overdue';

  return (
    <button
      type="button"
      data-task
      onClick={(e) => {
        e.stopPropagation();
        onOpen(task);
      }}
      className={`
        relative w-full flex items-center min-h-[22px] max-h-[22px]
        pl-1.5 pr-1 rounded-md border border-theme/80
        bg-theme-elevated hover:bg-theme-base
        text-left cursor-pointer transition-colors overflow-hidden
        ${overdue ? 'opacity-75' : ''}
      `}
    >
      <span className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-l-md ${priority?.dot}`} />
      <span
        className={`
          text-[10px] leading-tight truncate text-theme-main pl-1
          ${overdue ? 'line-through text-theme-muted' : ''}
        `}
      >
        {task.title || 'Без названия'}
      </span>
    </button>
  );
}

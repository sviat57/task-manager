import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayTaskPanel } from './DayTaskPanel';
import { TodayTasksSection } from '../tasks/TodayTasksSection';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  getMonthGrid,
  groupTasksByCalendarDay,
  dayKey,
  getDeadlineUrgency,
} from '../../utils/deadlineHelpers';
import { PRIORITIES } from '../../constants';
import { useSwipe } from '../../hooks/useSwipe';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MAX_TASKS_DESKTOP = 3;

function capitalizeMonth(label) {
  if (!label) return label;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Календарь дедлайнов — month view со свайпом месяцев. */
export function DeadlineCalendar({
  tasks,
  onOpen,
  onAddTaskForDay,
  onAddTask,
  onToggle,
  onDelete,
  onToggleSubtask,
}) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [slideDir, setSlideDir] = useState(0);

  const monthDays = useMemo(() => getMonthGrid(viewDate), [viewDate]);
  const tasksByDay = useMemo(() => groupTasksByCalendarDay(tasks), [tasks]);

  const monthTitle = capitalizeMonth(
    format(viewDate, 'LLLL yyyy', { locale: ru })
  );
  const monthKey = format(viewDate, 'yyyy-MM');

  const goNextMonth = useCallback(() => {
    setSlideDir(1);
    setViewDate((d) => addMonths(d, 1));
  }, []);

  const goPrevMonth = useCallback(() => {
    setSlideDir(-1);
    setViewDate((d) => subMonths(d, 1));
  }, []);

  const goToday = useCallback(() => {
    setSlideDir(0);
    setViewDate(new Date());
  }, []);

  const swipeHandlers = useSwipe({
    onSwipeLeft:  goNextMonth,
    onSwipeRight: goPrevMonth,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col flex-1 min-h-0 space-y-4 calendar-swipe-root"
      style={{
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <TodayTasksSection
        tasks={tasks}
        onOpen={onOpen}
        onToggle={onToggle}
        onAddTask={onAddTask ?? (() => onAddTaskForDay?.(new Date()))}
        compact
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <NavButton aria-label="Предыдущий месяц" onClick={goPrevMonth}>
            <ChevronLeft size={18} />
          </NavButton>
          <NavButton aria-label="Следующий месяц" onClick={goNextMonth}>
            <ChevronRight size={18} />
          </NavButton>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-theme-main order-first sm:order-none w-full sm:w-auto text-center sm:flex-1">
          {monthTitle}
        </h2>

        <button
          type="button"
          onClick={goToday}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl
            bg-theme-elevated border border-theme text-theme-main
            hover:bg-theme-surface transition-colors cursor-pointer shadow-card"
        >
          Сегодня
        </button>
      </div>

      <div
        className="rounded-card border border-theme bg-theme-surface shadow-card
          overflow-hidden flex flex-col flex-1 min-h-0 touch-pan-y"
        onTouchStart={swipeHandlers.onTouchStart}
        onTouchMove={swipeHandlers.onTouchMove}
        onTouchEnd={swipeHandlers.onTouchEnd}
      >
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

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={monthKey}
            initial={{ opacity: 0, x: slideDir >= 0 ? 48 : -48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDir >= 0 ? -48 : 48 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="calendar-month-grid calendar-month-body flex-1 calendar-slide-panel"
          >
            {monthDays.map((day) => (
              <DayCell
                key={dayKey(day.date)}
                day={day}
                tasks={tasksByDay.get(dayKey(day.date)) || []}
                onOpenDay={setSelectedDay}
              />
            ))}
          </motion.div>
        </AnimatePresence>
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

function DayCell({ day, tasks: dayTasks, onOpenDay }) {
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
      data-swipe-ignore
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

      <div className="flex flex-wrap gap-0.5 md:hidden min-h-[14px]" data-horizontal-scroll>
        {dayTasks.slice(0, 5).map((task) => (
          <span
            key={task.id}
            title={task.title || 'Без названия'}
            className={`w-2 h-2 rounded-full flex-shrink-0
              ${PRIORITIES[task.priority]?.dot || 'bg-theme-muted'}`}
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
          <CalendarMiniTask key={task.id} task={task} />
        ))}
        {extra > 0 && (
          <span className="text-[10px] text-theme-muted px-1 font-medium">
            +{extra} ещё
          </span>
        )}
      </div>
    </div>
  );
}

function CalendarMiniTask({ task }) {
  const priority = PRIORITIES[task.priority];
  const overdue = getDeadlineUrgency(task.deadline, task.completed) === 'overdue';

  return (
    <div
      className={`
        relative w-full flex items-center min-h-[22px] max-h-[22px]
        pl-1.5 pr-1 rounded-md border border-theme/80
        bg-theme-elevated
        text-left overflow-hidden pointer-events-none
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
    </div>
  );
}

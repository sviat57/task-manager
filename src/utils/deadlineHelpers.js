import {
  isToday, isTomorrow, addDays, startOfDay, differenceInMinutes,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isSameDay, format,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { PRIORITIES } from '../constants';

const MS_HOUR = 60 * 60 * 1000;
const MS_MIN  = 60 * 1000;

/** Уровень срочности дедлайна для визуальной индикации */
export function getDeadlineUrgency(deadline, completed = false) {
  if (!deadline || completed) return 'none';
  const diffMs = new Date(deadline).getTime() - Date.now();
  if (diffMs <= 0) return 'overdue';
  if (diffMs < 30 * MS_MIN) return 'critical';
  if (diffMs < 3 * MS_HOUR) return 'urgent';
  if (diffMs < 24 * MS_HOUR) return 'warning';
  return 'normal';
}

/** ISO → значение для input[type=datetime-local] */
export function toDatetimeLocalValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local → ISO для хранения */
export function fromDatetimeLocalValue(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

/** Сортировка: ближайшие дедлайны, без дедлайна — внизу */
export function compareByDeadline(a, b) {
  const aHas = Boolean(a.deadline);
  const bHas = Boolean(b.deadline);
  if (aHas && !bHas) return -1;
  if (!aHas && bHas) return 1;
  if (!aHas && !bHas) return 0;
  return new Date(a.deadline) - new Date(b.deadline);
}

/** Фокус дня: ближайший дедлайн сегодня + максимальный приоритет */
export function getTodayFocusTask(tasks) {
  const todayTasks = tasks.filter(
    (t) => !t.completed && t.deadline && isToday(new Date(t.deadline))
  );
  if (!todayTasks.length) return null;

  return [...todayTasks].sort((a, b) => {
    const byDeadline = new Date(a.deadline) - new Date(b.deadline);
    if (byDeadline !== 0) return byDeadline;
    return (PRIORITIES[b.priority]?.order || 0) - (PRIORITIES[a.priority]?.order || 0);
  })[0];
}

/** Все задачи на сегодня + просроченные, отсортированы: просроченные первыми */
export function getTodayTasks(tasks) {
  const now = new Date();
  return tasks
    .filter(t => !t.completed && t.deadline && (
      isToday(new Date(t.deadline)) || new Date(t.deadline) < now
    ))
    .sort((a, b) => {
      const aOverdue = new Date(a.deadline) < now ? 0 : 1;
      const bOverdue = new Date(b.deadline) < now ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      return new Date(a.deadline) - new Date(b.deadline);
    });
}

/** Группировка для экрана «Календарь дедлайнов» */
export function groupTasksByDeadlineDay(tasks) {
  const active = tasks.filter((t) => !t.completed && t.deadline);
  const today    = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);

  const buckets = {
    overdue:  { id: 'overdue',  label: 'Просрочено',   tasks: [] },
    today:    { id: 'today',    label: 'Сегодня',      tasks: [] },
    tomorrow: { id: 'tomorrow', label: 'Завтра',       tasks: [] },
    dayAfter: { id: 'dayAfter', label: 'Послезавтра',  tasks: [] },
    later:    { id: 'later',    label: 'Далее',        tasks: [] },
  };

  const sorted = [...active].sort(compareByDeadline);

  for (const task of sorted) {
    const d = startOfDay(new Date(task.deadline));
    const dl = new Date(task.deadline);

    if (dl < new Date() && !isToday(dl)) {
      buckets.overdue.tasks.push(task);
    } else if (isToday(dl)) {
      buckets.today.tasks.push(task);
    } else if (isTomorrow(dl)) {
      buckets.tomorrow.tasks.push(task);
    } else if (d.getTime() === dayAfter.getTime()) {
      buckets.dayAfter.tasks.push(task);
    } else {
      buckets.later.tasks.push(task);
    }
  }

  return [
    buckets.overdue,
    buckets.today,
    buckets.tomorrow,
    buckets.dayAfter,
    buckets.later,
  ].filter((b) => b.tasks.length > 0);
}

/** Минуты до дедлайна (отрицательные = просрочено) */
export function minutesUntilDeadline(deadline) {
  if (!deadline) return null;
  return differenceInMinutes(new Date(deadline), new Date());
}

/** Ключ дня для группировки задач в календаре */
export function dayKey(date) {
  return format(startOfDay(date), 'yyyy-MM-dd');
}

/** Дедлайн на выбранный день (по умолчанию 09:00 локального времени) */
export function buildDeadlineISOForDay(date, hours = 9, minutes = 0) {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

/** Сетка месяца: Пн–Вс, с хвостами соседних месяцев */
export function getMonthGrid(viewDate) {
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => ({
    date,
    inMonth: isSameMonth(date, viewDate),
    isToday: isSameDay(date, new Date()),
  }));
}

/** Все задачи с дедлайном в конкретный день (для панели дня) */
export function getTasksForDay(tasks, date) {
  return tasks
    .filter((t) => t.deadline && isSameDay(new Date(t.deadline), date))
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
}

/** Заголовок панели дня: «15 мая, четверг» */
export function formatDayPanelTitle(date) {
  const label = format(date, 'd MMMM, EEEE', { locale: ru });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Время дедлайна для списка */
export function formatTaskDeadlineTime(deadline) {
  if (!deadline) return '';
  return format(new Date(deadline), 'HH:mm');
}

/** Map yyyy-MM-dd → задачи с дедлайном в этот день */
export function groupTasksByCalendarDay(tasks, includeCompleted = false) {
  const map = new Map();

  for (const task of tasks) {
    if (!task.deadline) continue;
    if (!includeCompleted && task.completed) continue;

    const key = dayKey(new Date(task.deadline));
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(task);
  }

  for (const list of map.values()) {
    list.sort(compareByDeadline);
  }

  return map;
}

/** Минимальный снимок задачи для SW / localStorage */
export function toNotificationTask(task) {
  return {
    id: task.id,
    title: task.title || 'Без названия',
    deadline: task.deadline || '',
    priority: task.priority || 'medium',
    completed: Boolean(task.completed),
  };
}

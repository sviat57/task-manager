// ─── Приоритеты задач ────────────────────────────────────────────────────────
export const PRIORITIES = {
  low: {
    label: 'Низкий',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    order: 1,
  },
  medium: {
    label: 'Средний',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
    order: 2,
  },
  high: {
    label: 'Высокий',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/30',
    border: 'border-orange-200 dark:border-orange-800',
    dot: 'bg-orange-500',
    order: 3,
  },
  urgent: {
    label: 'Срочный',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
    order: 4,
  },
};

// ─── Категории/теги ──────────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'work',     label: 'Работа',   color: 'bg-violet-500', light: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
  { id: 'personal', label: 'Личное',   color: 'bg-pink-500',   light: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
  { id: 'study',    label: 'Учёба',    color: 'bg-amber-500',  light: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { id: 'health',   label: 'Здоровье', color: 'bg-emerald-500',light: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { id: 'finance',  label: 'Финансы',  color: 'bg-cyan-500',   light: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
  { id: 'other',    label: 'Другое',   color: 'bg-slate-500',  light: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300' },
];

// ─── Колонки Канбан-доски ─────────────────────────────────────────────────────
export const KANBAN_COLUMNS = [
  { id: 'todo',       label: 'К выполнению', emoji: '📋', color: 'border-slate-300 dark:border-slate-600' },
  { id: 'inprogress', label: 'В процессе',   emoji: '⚡', color: 'border-blue-400 dark:border-blue-600' },
  { id: 'done',       label: 'Готово',       emoji: '✅', color: 'border-emerald-400 dark:border-emerald-600' },
];

// ─── Навигация ────────────────────────────────────────────────────────────────
export const VIEWS = {
  LIST:     'list',
  CALENDAR: 'calendar',
  KANBAN:   'kanban',
  STATS:    'stats',
  TRASH:    'trash',
};

// ─── Сортировка ───────────────────────────────────────────────────────────────
export const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Сначала новые' },
  { value: 'createdAt_asc',  label: 'Сначала старые' },
  { value: 'deadline_asc',   label: 'По дедлайну' },
  { value: 'priority_desc',  label: 'По приоритету' },
  { value: 'title_asc',      label: 'По алфавиту' },
];
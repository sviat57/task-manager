import { format, isToday, isTomorrow, isPast, isThisWeek } from 'date-fns';
import { ru } from 'date-fns/locale';

// Форматируем дедлайн в читаемый вид
export function formatDeadline(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isToday(date))    return `Сегодня, ${format(date, 'HH:mm')}`;
  if (isTomorrow(date)) return `Завтра, ${format(date, 'HH:mm')}`;
  return format(date, 'd MMM, HH:mm', { locale: ru });
}

// Определяем, просрочена ли задача
export function isOverdue(dateStr) {
  if (!dateStr) return false;
  return isPast(new Date(dateStr));
}

// Прогресс подзадач (0–100)
export function getSubtaskProgress(subtasks = []) {
  if (!subtasks.length) return 0;
  const done = subtasks.filter(s => s.completed).length;
  return Math.round((done / subtasks.length) * 100);
}

// Генерируем уникальный ID
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Получаем категорию по id
export function getCategoryById(categories, id) {
  return categories.find(c => c.id === id) || null;
}

// Фильтрация задач: выполнено сегодня
export function completedToday(tasks) {
  return tasks.filter(
    t => t.completed && t.completedAt && isToday(new Date(t.completedAt))
  );
}

// Фильтрация задач: выполнено за эту неделю
export function completedThisWeek(tasks) {
  return tasks.filter(
    t => t.completed && t.completedAt && isThisWeek(new Date(t.completedAt), { weekStartsOn: 1 })
  );
}
export function plural(number, one, few, many) {
  const n = Math.abs(number) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return many;
  if (n1 > 1 && n1 < 5) return few;
  if (n1 === 1) return one;
  return many;
}
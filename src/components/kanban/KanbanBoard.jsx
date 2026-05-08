import { useRef } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { KANBAN_COLUMNS } from '../../constants';

/**
 * KanbanBoard — доска с тремя колонками.
 *
 * Мобильный UX:
 *  • Каждая колонка занимает 85vw — видно что можно скроллить
 *  • scroll-snap-type: x mandatory — колонки "прилипают" при свайпе
 *  • На десктопе (md+) — обычный flex с равной шириной колонок
 */
export function KanbanBoard({
  tasks, onAddTask, onToggle, onDelete,
  onOpen, onChangeStatus, onToggleSubtask
}) {
  const scrollRef = useRef(null);

  // Группируем задачи по статусам колонок
  const grouped = KANBAN_COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => {
      if (col.id === 'done')       return t.completed || t.status === 'done';
      if (col.id === 'inprogress') return !t.completed && t.status === 'inprogress';
      return !t.completed && (t.status === 'todo' || !t.status);
    });
    return acc;
  }, {});

  const handleDrop = (taskId, newStatus) => onChangeStatus(taskId, newStatus);

  return (
    <div className="relative">
      {/* Подсказка скролла — видна только на мобиле */}
      <p className="md:hidden text-xs text-slate-400 dark:text-slate-600 mb-3 text-center">
        ← Свайп для переключения колонок →
      </p>

      {/*
        Контейнер скролла:
        - На мобиле: горизонтальный скролл со snap
        - На десктопе: обычный flex
        overflow-x-auto + scroll-snap-type задаём через style (Tailwind не имеет scroll-snap-type x mandatory)
      */}
      <div
        ref={scrollRef}
        className="flex gap-3 pb-4 md:gap-4 md:overflow-x-auto"
        style={{
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch', // плавный скролл на iOS
          scrollbarWidth: 'none',           // скрываем скроллбар (Firefox)
          msOverflowStyle: 'none',          // скрываем скроллбар (IE/Edge)
        }}
      >
        {KANBAN_COLUMNS.map((col, idx) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={grouped[col.id] || []}
            onAddTask={onAddTask}
            onToggle={onToggle}
            onDelete={onDelete}
            onOpen={onOpen}
            onDrop={handleDrop}
            onToggleSubtask={onToggleSubtask}
            // Передаём индекс чтобы первая/последняя колонка
            // имели правильные отступы при snap-скролле
            isFirst={idx === 0}
            isLast={idx === KANBAN_COLUMNS.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { TaskItem } from '../tasks/TaskItem';

/**
 * KanbanColumn — одна колонка канбан-доски.
 *
 * Ширина:
 *  • Мобиле (< md): 85vw — почти на весь экран, scroll-snap-align: start
 *  • Десктоп (md+): flex-1, минимум 260px
 *
 * Карточки на мобиле чуть компактнее через пропс isMobile (определяем через CSS-класс).
 */
export function KanbanColumn({
  column, tasks, onAddTask, onToggle, onDelete,
  onOpen, onDrop, onToggleSubtask, isFirst, isLast
}) {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) onDrop(taskId, column.id);
  };

  // Цвет верхней полоски колонки
  const accentColor = {
    todo:       '#94a3b8', // slate-400
    inprogress: '#3b82f6', // blue-500
    done:       '#10b981', // emerald-500
  }[column.id] || '#94a3b8';

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        flex flex-col
        bg-slate-50 dark:bg-slate-800/40
        rounded-2xl p-3 border-t-2
        flex-shrink-0
        transition-colors duration-200
        /* Мобиле: 85vw, snap */
        w-[85vw]
        /* Планшет и выше: равные колонки */
        md:w-auto md:flex-1 md:min-w-[260px]
        ${isFirst ? 'ml-0' : ''}
        ${isLast  ? 'mr-0' : ''}
      `}
      style={{
        borderTopColor: accentColor,
        // scroll-snap-align задаём инлайном — Tailwind не покрывает этот класс
        scrollSnapAlign: 'start',
        // На мобиле небольшой отступ чтобы была видна следующая колонка
        scrollMarginLeft: isFirst ? '0' : undefined,
      }}
    >
      {/* ── Шапка колонки ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{column.emoji}</span>
          <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
            {column.label}
          </span>
          <span className="text-xs text-slate-400 bg-slate-200 dark:bg-slate-700
            px-1.5 py-0.5 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>
        {column.id !== 'done' && (
          <button
            onClick={onAddTask}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700
              text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
              transition-colors cursor-pointer"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* ── Задачи в колонке ──────────────────────────────────────────── */}
      <div className="space-y-2 flex-1 min-h-[100px]">
        <AnimatePresence mode="popLayout">
          {tasks.map(task => (
            <motion.div
              key={task.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
              style={{ cursor: 'grab' }}
              whileDrag={{ scale: 1.02, opacity: 0.9, cursor: 'grabbing' }}
            >
              {/*
                В Канбане всегда isGrid=false чтобы карточки были компактными.
                Описание не показываем (truncate), подзадачи раскрываются стрелкой.
              */}
              <TaskItem
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onOpen={onOpen}
                onToggleSubtask={onToggleSubtask}
                isGrid={false}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Зона дропа когда колонка пустая */}
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-24 border-2 border-dashed
              border-slate-200 dark:border-slate-700 rounded-xl"
          >
            <p className="text-xs text-slate-400 dark:text-slate-600 text-center px-4">
              Перетащите задачу сюда
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
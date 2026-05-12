import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { TaskItem } from '../tasks/TaskItem';
 
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
 
  const accentColor = {
    todo:       'var(--color-muted)',
    inprogress: '#3b82f6',
    done:       '#10b981',
  }[column.id] || 'var(--color-muted)';
 
  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        flex flex-col bg-theme-elevated
        rounded-card p-3 border-t-2
        flex-shrink-0 transition-colors duration-200
        w-[85vw] md:w-auto md:flex-1 md:min-w-[260px]
        ${isFirst ? 'ml-0' : ''}
        ${isLast  ? 'mr-0' : ''}
      `}
      style={{
        borderTopColor: accentColor,
        scrollSnapAlign: 'start',
        scrollMarginLeft: isFirst ? '0' : undefined,
      }}
    >
      {/* Шапка колонки */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{column.emoji}</span>
          <span className="font-semibold text-sm text-theme-main">
            {column.label}
          </span>
          {/* Счётчик задач */}
          <span className="text-xs text-theme-muted bg-theme-surface
            border border-theme px-1.5 py-0.5 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>
        {column.id !== 'done' && (
          <button
            onClick={onAddTask}
            className="p-1.5 rounded-lg hover:bg-theme-surface
              text-theme-muted hover:text-theme-main
              transition-colors cursor-pointer"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
 
      {/* Задачи */}
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
 
        {/* Пустая зона дропа */}
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-24 border-2 border-dashed
              border-theme rounded-xl"
          >
            <p className="text-xs text-theme-muted text-center px-4">
              Перетащите задачу сюда
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

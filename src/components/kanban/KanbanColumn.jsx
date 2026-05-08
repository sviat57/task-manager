import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { TaskItem } from '../tasks/TaskItem';

export function KanbanColumn({ column, tasks, onAddTask, onToggle, onDelete, onOpen, onDrop, onToggleSubtask }) {
  // Обработка drag-and-drop (нативный HTML5 API)
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) onDrop(taskId, column.id);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex flex-col min-w-[280px] flex-1 bg-slate-50 dark:bg-slate-800/40
        rounded-2xl p-3 border-t-2 transition-colors duration-200"
      style={{ borderTopColor: column.color.includes('blue') ? '#3b82f6' :
               column.color.includes('emerald') ? '#10b981' : '#94a3b8' }}
    >
      {/* Шапка колонки */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{column.emoji}</span>
          <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
            {column.label}
          </span>
          <span className="text-xs text-slate-400 bg-slate-200 dark:bg-slate-700
            px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        {column.id !== 'done' && (
          <button
            onClick={onAddTask}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700
              text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Задачи */}
      <div className="space-y-2 flex-1 min-h-[120px]">
        <AnimatePresence mode="popLayout">
          {tasks.map(task => (
            <motion.div
              key={task.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
              style={{ cursor: 'grab' }}
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

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 border-2 border-dashed
            border-slate-200 dark:border-slate-700 rounded-xl">
            <p className="text-xs text-slate-400">Перетащите задачу сюда</p>
          </div>
        )}
      </div>
    </div>
  );
}
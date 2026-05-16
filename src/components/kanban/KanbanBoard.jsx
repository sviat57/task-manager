import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { TaskItem } from '../tasks/TaskItem';
import { MobileKanban } from './MobileKanban';
import { KANBAN_COLUMNS } from '../../constants';
 
/**
 * KanbanBoard — адаптивная канбан-доска.
 * На мобиле (< 768px) показывает MobileKanban с циклическим свайпом.
 * На десктопе — классический трёхколоночный layout.
 */
export function KanbanBoard({
  tasks, onAddTask, onToggle, onDelete,
  onOpen, onChangeStatus, onToggleSubtask
}) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
 
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    const mq = window.matchMedia('(max-width: 767px)');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
 
  if (isMobile) {
    return (
      <MobileKanban
        tasks={tasks}
        onAddTask={onAddTask}
        onToggle={onToggle}
        onDelete={onDelete}
        onOpen={onOpen}
        onChangeStatus={onChangeStatus}
        onToggleSubtask={onToggleSubtask}
      />
    );
  }
 
  // ── Десктоп: классический layout ─────────────────────────────────────────
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
    <div className="flex flex-1 min-h-0 gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((col, idx) => (
        <DesktopColumn
          key={col.id}
          column={col}
          tasks={grouped[col.id] || []}
          onAddTask={onAddTask}
          onToggle={onToggle}
          onDelete={onDelete}
          onOpen={onOpen}
          onDrop={handleDrop}
          onToggleSubtask={onToggleSubtask}
          isFirst={idx === 0}
          isLast={idx === KANBAN_COLUMNS.length - 1}
        />
      ))}
    </div>
  );
}
 
/* ── Десктопная колонка ──────────────────────────────────────────────────── */
function DesktopColumn({
  column, tasks, onAddTask, onToggle, onDelete,
  onOpen, onDrop, onToggleSubtask, isFirst, isLast
}) {
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
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
      className="flex flex-col bg-theme-elevated rounded-card p-3 border-t-2
        flex-1 min-w-[260px] transition-colors duration-200"
      style={{ borderTopColor: accentColor }}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{column.emoji}</span>
          <span className="font-semibold text-sm text-theme-main">{column.label}</span>
          <span className="text-xs text-theme-muted bg-theme-surface border border-theme
            px-1.5 py-0.5 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>
        {column.id !== 'done' && (
          <button onClick={onAddTask}
            className="p-1.5 rounded-lg hover:bg-theme-surface text-theme-muted
              hover:text-theme-main transition-colors cursor-pointer">
            <Plus size={14} />
          </button>
        )}
      </div>
 
      <div className="space-y-2 flex-1 min-h-[100px]">
        <AnimatePresence mode="popLayout">
          {tasks.map(task => (
            <motion.div
              key={task.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
              style={{ cursor: 'grab' }}
              whileDrag={{ scale: 1.02, opacity: 0.9 }}
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
          <div className="flex items-center justify-center h-24 border-2
            border-dashed border-theme rounded-xl">
            <p className="text-xs text-theme-muted text-center px-4">
              Перетащите задачу сюда
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

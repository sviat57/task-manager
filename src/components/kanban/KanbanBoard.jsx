import { KanbanColumn } from './KanbanColumn';
import { KANBAN_COLUMNS } from '../../constants';

export function KanbanBoard({ tasks, onAddTask, onToggle, onDelete, onOpen, onChangeStatus, onToggleSubtask }) {
  // Группируем задачи по статусам
  const grouped = KANBAN_COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => {
      if (col.id === 'done')       return t.completed || t.status === 'done';
      if (col.id === 'inprogress') return !t.completed && t.status === 'inprogress';
      return !t.completed && (t.status === 'todo' || !t.status);
    });
    return acc;
  }, {});

  const handleDrop = (taskId, newStatus) => {
    onChangeStatus(taskId, newStatus);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map(col => (
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
        />
      ))}
    </div>
  );
}
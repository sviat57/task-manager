import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { generateId } from '../utils/helpers';

/**
 * Главный хук бизнес-логики задач.
 * Инкапсулирует все CRUD-операции и работу с подзадачами.
 */
export function useTasks() {
  const [tasks, setTasks] = useLocalStorage('tm_tasks', []);

  // ── Создать задачу ──────────────────────────────────────────────────────────
  const addTask = useCallback((taskData) => {
    const newTask = {
      id: generateId(),
      title: '',
      description: '',
      priority: 'medium',
      category: 'work',
      deadline: '',
      subtasks: [],
      status: 'todo',        // todo | inprogress | done
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      ...taskData,
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, [setTasks]);

  // ── Обновить задачу ─────────────────────────────────────────────────────────
  const updateTask = useCallback((id, changes) => {
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, ...changes } : t)
    );
  }, [setTasks]);

  // ── Удалить задачу ──────────────────────────────────────────────────────────
  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, [setTasks]);

  // ── Переключить выполнение ──────────────────────────────────────────────────
  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const completed = !t.completed;
      return {
        ...t,
        completed,
        status: completed ? 'done' : 'todo',
        completedAt: completed ? new Date().toISOString() : null,
      };
    }));
  }, [setTasks]);

  // ── Изменить статус (для Канбан) ────────────────────────────────────────────
  const changeStatus = useCallback((id, status) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const completed = status === 'done';
      return {
        ...t,
        status,
        completed,
        completedAt: completed && !t.completedAt ? new Date().toISOString() : t.completedAt,
      };
    }));
  }, [setTasks]);

  // ── Добавить подзадачу ──────────────────────────────────────────────────────
  const addSubtask = useCallback((taskId, title) => {
    const subtask = { id: generateId(), title, completed: false };
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask] } : t
    ));
  }, [setTasks]);

  // ── Переключить подзадачу ───────────────────────────────────────────────────
  const toggleSubtask = useCallback((taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subtasks: t.subtasks.map(s =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        ),
      };
    }));
  }, [setTasks]);

  // ── Удалить подзадачу ───────────────────────────────────────────────────────
  const deleteSubtask = useCallback((taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) };
    }));
  }, [setTasks]);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    changeStatus,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  };
}
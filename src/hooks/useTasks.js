import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { generateId } from '../utils/helpers';

/**
 * Хук задач с Supabase backend.
 *
 * Принимает user — объект авторизованного пользователя.
 * Если user === null — задачи не загружаются.
 *
 * Все CRUD-операции оптимистичны: сначала обновляем локальный стейт
 * (UI реагирует мгновенно), затем синхронизируем с базой.
 * При ошибке — откатываем стейт назад.
 */
export function useTasks(user) {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── Загрузка задач при смене пользователя ──────────────────────────────────
  useEffect(() => {
    if (!user) { setTasks([]); return; }
    fetchTasks();
    const unsub = subscribeToRealtime();
    return () => { unsub(); };
  }, [user?.id]);

  // ── Первичная загрузка из БД ───────────────────────────────────────────────
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;
      // Преобразуем snake_case Supabase → camelCase приложения
      setTasks(data.map(dbToApp));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Realtime-подписка: слушаем INSERT/UPDATE/DELETE в таблице tasks ────────
  const subscribeToRealtime = () => {
    const channel = supabase
      .channel(`tasks:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;

          setTasks(prev => {
            switch (eventType) {
              case 'INSERT':
                // Не дублируем если уже добавили оптимистично
                if (prev.find(t => t.id === newRow.id)) return prev;
                return [dbToApp(newRow), ...prev];
              case 'UPDATE':
                return prev.map(t => t.id === newRow.id ? dbToApp(newRow) : t);
              case 'DELETE':
                return prev.filter(t => t.id !== oldRow.id);
              default:
                return prev;
            }
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  // ── Конвертер: БД (snake_case) → приложение (camelCase) ───────────────────
  const dbToApp = (row) => ({
    id:          row.id,
    title:       row.title,
    description: row.description,
    priority:    row.priority,
    category:    row.category,
    deadline:    row.deadline,
    subtasks:    row.subtasks || [],
    status:      row.status,
    completed:   row.completed,
    completedAt: row.completed_at,
    createdAt:   row.created_at,
  });

  // ── Конвертер: приложение → БД ─────────────────────────────────────────────
  const appToDb = (task) => ({
    id:           task.id,
    user_id:      user.id,
    title:        task.title        || '',
    description:  task.description  || '',
    priority:     task.priority     || 'medium',
    category:     task.category     || 'work',
    deadline:     task.deadline     || '',
    subtasks:     task.subtasks     || [],
    status:       task.status       || 'todo',
    completed:    task.completed    || false,
    completed_at: task.completedAt  || null,
  });

  // ── Создать задачу ──────────────────────────────────────────────────────────
  const addTask = useCallback(async (taskData) => {
    const newTask = {
      id:          generateId(),
      title:       '',
      description: '',
      priority:    'medium',
      category:    'work',
      deadline:    '',
      subtasks:    [],
      status:      'todo',
      completed:   false,
      completedAt: null,
      createdAt:   new Date().toISOString(),
      ...taskData,
    };

    // Оптимистичное обновление UI
    setTasks(prev => [newTask, ...prev]);

    const { error: err } = await supabase
      .from('tasks')
      .insert(appToDb(newTask));

    if (err) {
      // Откат при ошибке
      setTasks(prev => prev.filter(t => t.id !== newTask.id));
      setError(err.message);
    }

    return newTask;
  }, [user]);

  // ── Обновить задачу ─────────────────────────────────────────────────────────
  const updateTask = useCallback(async (id, changes) => {
    // Сохраняем предыдущий стейт для отката
    setTasks(prev => {
      const old = prev.find(t => t.id === id);
      if (!old) return prev;

      const updated = { ...old, ...changes };

      // Пишем в БД асинхронно
      supabase
        .from('tasks')
        .update(appToDb(updated))
        .eq('id', id)
        .then(({ error: err }) => {
          if (err) {
            // Откат
            setTasks(p => p.map(t => t.id === id ? old : t));
            setError(err.message);
          }
        });

      return prev.map(t => t.id === id ? updated : t);
    });
  }, [user]);

  // ── Удалить задачу ──────────────────────────────────────────────────────────
  const deleteTask = useCallback(async (id) => {
    const backup = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));

    const { error: err } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (err) {
      setTasks(prev => backup ? [backup, ...prev] : prev);
      setError(err.message);
    }
  }, [tasks, user]);

  // ── Переключить выполнение ──────────────────────────────────────────────────
  const toggleTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const completed    = !task.completed;
    const completedAt  = completed ? new Date().toISOString() : null;
    const status       = completed ? 'done' : 'todo';

    await updateTask(id, { completed, completedAt, status });
  }, [tasks, updateTask]);

  // ── Изменить статус (Канбан) ────────────────────────────────────────────────
  const changeStatus = useCallback(async (id, status) => {
    const completed   = status === 'done';
    const completedAt = completed ? new Date().toISOString() : null;
    await updateTask(id, { status, completed, completedAt });
  }, [updateTask]);

  // ── Добавить подзадачу ──────────────────────────────────────────────────────
  const addSubtask = useCallback(async (taskId, title) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask  = { id: generateId(), title, completed: false };
    const subtasks = [...task.subtasks, subtask];
    await updateTask(taskId, { subtasks });
  }, [tasks, updateTask]);

  // ── Переключить подзадачу + умный статус Канбана ───────────────────────────
  const toggleSubtask = useCallback(async (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtasks = task.subtasks.map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );

    const anyDone = subtasks.some(s => s.completed);
    let newStatus = task.status;
    if (task.status === 'todo' && anyDone) newStatus = 'inprogress';

    await updateTask(taskId, { subtasks, status: newStatus });
  }, [tasks, updateTask]);

  // ── Удалить подзадачу ───────────────────────────────────────────────────────
  const deleteSubtask = useCallback(async (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtasks = task.subtasks.filter(s => s.id !== subtaskId);
    await updateTask(taskId, { subtasks });
  }, [tasks, updateTask]);

  return {
    tasks, loading, error,
    addTask, updateTask, deleteTask,
    toggleTask, changeStatus,
    addSubtask, toggleSubtask, deleteSubtask,
  };
}
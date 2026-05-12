import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { generateId } from '../utils/helpers';

/**
 * useTasks — главный хук работы с задачами.
 *
 * Новое в этой версии:
 *  • Soft-delete: moveToTrash / restoreTask / permanentDelete
 *  • tasks    — только живые задачи (is_deleted = false)
 *  • trashed  — только задачи в корзине (is_deleted = true)
 *  • Умный Канбан (двусторонний):
 *      todo → inprogress  когда хоть одна подзадача выполнена
 *      inprogress → todo  когда сняты ВСЕ галочки подзадач
 */
export function useTasks(user) {
  const [tasks,   setTasks]   = useState([]);   // живые задачи
  const [trashed, setTrashed] = useState([]);   // корзина
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── Загрузка при смене пользователя ───────────────────────────────────────
  useEffect(() => {
    if (!user) { setTasks([]); setTrashed([]); return; }
    fetchAll();
    const unsub = subscribeRealtime();
    return () => unsub();
  }, [user?.id]);

  // ── Загрузить все задачи (живые + корзина) ────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;

      const all = data.map(dbToApp);
      setTasks(all.filter(t => !t.isDeleted));
      setTrashed(all.filter(t => t.isDeleted));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Realtime ──────────────────────────────────────────────────────────────
  const subscribeRealtime = () => {
    const channel = supabase
      .channel(`tasks:${user.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'tasks',
        filter: `user_id=eq.${user.id}`,
      }, ({ eventType, new: n, old: o }) => {

        const upsert = (prev, row) => {
          const exists = prev.find(t => t.id === row.id);
          return exists
            ? prev.map(t => t.id === row.id ? row : t)
            : [row, ...prev];
        };

        if (eventType === 'DELETE') {
          setTasks(p => p.filter(t => t.id !== o.id));
          setTrashed(p => p.filter(t => t.id !== o.id));
          return;
        }

        const item = dbToApp(n);

        if (item.isDeleted) {
          // Переходит в корзину
          setTasks(p => p.filter(t => t.id !== item.id));
          setTrashed(p => upsert(p, item));
        } else {
          // Живая задача
          setTrashed(p => p.filter(t => t.id !== item.id));
          setTasks(p => {
            if (eventType === 'INSERT' && p.find(t => t.id === item.id)) return p;
            return upsert(p, item);
          });
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  // ── Конвертеры ────────────────────────────────────────────────────────────
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
    isDeleted:   row.is_deleted,
    deletedAt:   row.deleted_at,
  });

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
    is_deleted:   task.isDeleted    || false,
    deleted_at:   task.deletedAt    || null,
  });

  // ── Оптимистичное обновление с откатом ───────────────────────────────────
  const optimistic = useCallback(async (id, changes, dbChanges) => {
    // Сохраняем старые значения для отката
    let oldTask = null;
    const isLive = !changes.isDeleted;

    const updater = (setter) => setter(prev => {
      const found = prev.find(t => t.id === id);
      if (found) oldTask = found;
      return prev.map(t => t.id === id ? { ...t, ...changes } : t);
    });

    if (isLive) updater(setTasks); else updater(setTrashed);

    const { error: err } = await supabase
      .from('tasks')
      .update(dbChanges)
      .eq('id', id);

    if (err) {
      // Откат
      if (oldTask) {
        if (isLive) setTasks(p => p.map(t => t.id === id ? oldTask : t));
        else setTrashed(p => p.map(t => t.id === id ? oldTask : t));
      }
      setError(err.message);
    }
  }, [user]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const addTask = useCallback(async (taskData) => {
    const newTask = {
      id: generateId(),
      title: '', description: '', priority: 'medium',
      category: 'work', deadline: '', subtasks: [],
      status: 'todo', completed: false, completedAt: null,
      createdAt: new Date().toISOString(),
      isDeleted: false, deletedAt: null,
      ...taskData,
    };
    setTasks(prev => [newTask, ...prev]);
    const { error: err } = await supabase.from('tasks').insert(appToDb(newTask));
    if (err) {
      setTasks(prev => prev.filter(t => t.id !== newTask.id));
      setError(err.message);
    }
    return newTask;
  }, [user]);

  const updateTask = useCallback(async (id, changes) => {
    setTasks(prev => {
      const old = prev.find(t => t.id === id);
      if (!old) return prev;
      const updated = { ...old, ...changes };
      supabase.from('tasks').update(appToDb(updated)).eq('id', id)
        .then(({ error: err }) => {
          if (err) {
            setTasks(p => p.map(t => t.id === id ? old : t));
            setError(err.message);
          }
        });
      return prev.map(t => t.id === id ? updated : t);
    });
  }, [user]);

  const toggleTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const completed   = !task.completed;
    const completedAt = completed ? new Date().toISOString() : null;
    const status      = completed ? 'done' : 'todo';
    await updateTask(id, { completed, completedAt, status });
  }, [tasks, updateTask]);

  const changeStatus = useCallback(async (id, status) => {
    const completed   = status === 'done';
    const completedAt = completed ? new Date().toISOString() : null;
    await updateTask(id, { status, completed, completedAt });
  }, [updateTask]);

  // ── Двусторонний умный Канбан ─────────────────────────────────────────────
  const toggleSubtask = useCallback(async (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtasks = task.subtasks.map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );

    const doneCount = subtasks.filter(s => s.completed).length;
    let newStatus = task.status;

    if (task.status === 'todo' && doneCount > 0) {
      // Хоть одна выполнена — переводим в процесс
      newStatus = 'inprogress';
    } else if (task.status === 'inprogress' && doneCount === 0) {
      // Все сняты — возвращаем в todo
      newStatus = 'todo';
    }

    await updateTask(taskId, { subtasks, status: newStatus });
  }, [tasks, updateTask]);

  const addSubtask = useCallback(async (taskId, title) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const subtask  = { id: generateId(), title, completed: false };
    await updateTask(taskId, { subtasks: [...task.subtasks, subtask] });
  }, [tasks, updateTask]);

  const deleteSubtask = useCallback(async (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    await updateTask(taskId, {
      subtasks: task.subtasks.filter(s => s.id !== subtaskId),
    });
  }, [tasks, updateTask]);

  // ── Корзина ───────────────────────────────────────────────────────────────

  /** Мягкое удаление: задача уходит в корзину */
  const moveToTrash = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const deletedAt = new Date().toISOString();

    // Оптимистично: убираем из живых, добавляем в корзину
    setTasks(p => p.filter(t => t.id !== id));
    setTrashed(p => [{ ...task, isDeleted: true, deletedAt }, ...p]);

    const { error: err } = await supabase
      .from('tasks')
      .update({ is_deleted: true, deleted_at: deletedAt })
      .eq('id', id);

    if (err) {
      // Откат
      setTasks(p => [task, ...p]);
      setTrashed(p => p.filter(t => t.id !== id));
      setError(err.message);
    }
  }, [tasks]);

  /** Восстановление из корзины */
  const restoreTask = useCallback(async (id) => {
    const task = trashed.find(t => t.id === id);
    if (!task) return;

    const restored = { ...task, isDeleted: false, deletedAt: null };
    setTrashed(p => p.filter(t => t.id !== id));
    setTasks(p => [restored, ...p]);

    const { error: err } = await supabase
      .from('tasks')
      .update({ is_deleted: false, deleted_at: null })
      .eq('id', id);

    if (err) {
      setTasks(p => p.filter(t => t.id !== id));
      setTrashed(p => [task, ...p]);
      setError(err.message);
    }
  }, [trashed]);

  /** Безвозвратное удаление (только из корзины) */
  const permanentDelete = useCallback(async (id) => {
    const task = trashed.find(t => t.id === id);
    setTrashed(p => p.filter(t => t.id !== id));
    const { error: err } = await supabase.from('tasks').delete().eq('id', id);
    if (err) {
      setTrashed(p => task ? [task, ...p] : p);
      setError(err.message);
    }
  }, [trashed]);

  /** Очистить всю корзину */
  const emptyTrash = useCallback(async () => {
    const ids = trashed.map(t => t.id);
    setTrashed([]);
    const { error: err } = await supabase
      .from('tasks')
      .delete()
      .in('id', ids);
    if (err) {
      setTrashed(trashed);
      setError(err.message);
    }
  }, [trashed]);

  return {
    tasks, trashed, loading, error,
    addTask, updateTask,
    toggleTask, changeStatus,
    addSubtask, toggleSubtask, deleteSubtask,
    moveToTrash, restoreTask, permanentDelete, emptyTrash,
  };
}
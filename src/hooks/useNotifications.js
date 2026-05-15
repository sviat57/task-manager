import { useEffect, useCallback, useState } from 'react';
import { toNotificationTask } from '../utils/deadlineHelpers';

const LS_KEY = 'tm_notifications_tasks';

/** Синхронизация задач с SW и localStorage для уведомлений о дедлайнах */
export function useNotifications(tasks) {
  const [permission, setPermission] = useState(
    () => (typeof Notification !== 'undefined' ? Notification.permission : 'denied')
  );

  const syncTasks = useCallback((list) => {
    const payload = list
      .filter((t) => !t.completed && !t.isDeleted)
      .map(toNotificationTask);

    try {
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
    } catch (_) { /* quota */ }

    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready
      .then((reg) => {
        reg.active?.postMessage({ type: 'SYNC_TASKS', tasks: payload });
        reg.waiting?.postMessage({ type: 'SYNC_TASKS', tasks: payload });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    syncTasks(tasks);
  }, [tasks, syncTasks]);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'denied';
    if (Notification.permission === 'granted') {
      setPermission('granted');
      syncTasks(tasks);
      return 'granted';
    }
    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') syncTasks(tasks);
      return result;
    }
    return Notification.permission;
  }, [tasks, syncTasks]);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      const t = setTimeout(() => requestPermission(), 2000);
      return () => clearTimeout(t);
    }
  }, [requestPermission]);

  return { permission, requestPermission };
}

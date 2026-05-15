/* eslint-disable no-restricted-globals */
/**
 * Логика уведомлений в Service Worker (importScripts из Workbox SW).
 * Проверка каждые 5 минут + при SYNC_TASKS от клиента.
 */

const CHECK_MS = 5 * 60 * 1000;
const PRIORITY_ORDER = { urgent: 4, high: 3, medium: 2, low: 1 };
const STATE_CACHE = 'tm-notif-state-v1';

let tasks = [];
let sent = {};
let lastFocusDate = null;
let checkTimer = null;

function getFocusTask(list) {
  const now = new Date();
  const today = now.toDateString();
  const todayTasks = list.filter((t) => {
    if (t.completed || !t.deadline) return false;
    return new Date(t.deadline).toDateString() === today;
  });
  if (!todayTasks.length) return null;
  return todayTasks.sort((a, b) => {
    const dl = new Date(a.deadline) - new Date(b.deadline);
    if (dl !== 0) return dl;
    return (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
  })[0];
}

async function loadState() {
  try {
    const cache = await caches.open(STATE_CACHE);
    const res = await cache.match('/state');
    if (!res) return;
    const data = await res.json();
    sent = data.sent || {};
    lastFocusDate = data.lastFocusDate || null;
  } catch (_) { /* ignore */ }
}

async function saveState() {
  try {
    const cache = await caches.open(STATE_CACHE);
    await cache.put(
      '/state',
      new Response(JSON.stringify({ sent, lastFocusDate }))
    );
  } catch (_) { /* ignore */ }
}

function wasSent(key) {
  return Boolean(sent[key]);
}

function markSent(key) {
  sent[key] = Date.now();
}

async function showNotif(title, body, tag) {
  try {
    await self.registration.showNotification(title, {
      body,
      tag: tag || title,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      lang: 'ru',
      renotify: true,
    });
  } catch (_) { /* permission denied */ }
}

async function runChecks() {
  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10);

  // Утренний фокус в 9:00 (окно 5 минут)
  if (now.getHours() === 9 && now.getMinutes() < 5 && lastFocusDate !== dateKey) {
    const focus = getFocusTask(tasks);
    if (focus && !wasSent(`focus-${dateKey}`)) {
      await showNotif(
        `Фокус дня: ${focus.title}`,
        'Самая приоритетная задача на сегодня',
        `focus-${dateKey}`
      );
      markSent(`focus-${dateKey}`);
      lastFocusDate = dateKey;
      await saveState();
    }
  }

  for (const task of tasks) {
    if (task.completed || !task.deadline) continue;

    const title = task.title || 'Без названия';
    const dlMs = new Date(task.deadline).getTime() - now.getTime();
    const id = task.id;

    // За 3 часа (окно 5 мин)
    if (dlMs > 0 && dlMs <= 3 * 60 * 60 * 1000 + CHECK_MS && dlMs >= 3 * 60 * 60 * 1000 - CHECK_MS) {
      const key = `${id}-3h`;
      if (!wasSent(key)) {
        await showNotif(`Осталось 3 часа: ${title}`, 'Дедлайн приближается', key);
        markSent(key);
      }
    }

    // За 30 минут
    if (dlMs > 0 && dlMs <= 30 * 60 * 1000 + CHECK_MS && dlMs >= 30 * 60 * 1000 - CHECK_MS) {
      const key = `${id}-30m`;
      if (!wasSent(key)) {
        await showNotif(`Осталось 30 минут: ${title}`, 'Скоро дедлайн', key);
        markSent(key);
      }
    }

    // Дедлайн истёк (окно 5 мин после)
    if (dlMs <= 0 && dlMs > -CHECK_MS) {
      const key = `${id}-expired`;
      if (!wasSent(key)) {
        await showNotif(`Дедлайн истёк: ${title}`, 'Задача просрочена', key);
        markSent(key);
      }
    }
  }

  await saveState();
}

function scheduleChecks() {
  if (checkTimer) clearInterval(checkTimer);
  checkTimer = setInterval(() => runChecks(), CHECK_MS);
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SYNC_TASKS') {
    tasks = event.data.tasks || [];
    runChecks();
  }
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    loadState().then(() => {
      runChecks();
      scheduleChecks();
      return self.clients.claim();
    })
  );
});

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTasks } from './TasksContext.jsx';

const LIST_KEY = 'sf_notifications';
const FIRED_KEY = 'sf_notif_fired';
const PREFS_KEY = 'sf_notif_prefs';
const MAX_ITEMS = 50;
const DAY_MS = 24 * 3600000;

const NotificationsContext = createContext(null);

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sin almacenamiento disponible */
  }
}

// Umbrales de recordatorio: vencida · 1h · 12h · 24h.
// Cada (tarea + umbral) se avisa UNA sola vez gracias al registro sf_notif_fired.
const THRESHOLDS = [
  { key: 'overdue', test: (h) => h < 0, urgency: 1, text: (t) => `La tarea "${t.text}" ha vencido.` },
  { key: 'h1', test: (h) => h >= 0 && h <= 1, urgency: 2, text: (t) => `"${t.text}" vence en menos de 1 hora.` },
  { key: 'h12', test: (h) => h > 1 && h <= 12, urgency: 2, text: (t) => `"${t.text}" vence en menos de 12 horas.` },
  { key: 'h24', test: (h) => h > 12 && h <= 24, urgency: 3, text: (t) => `"${t.text}" vence en menos de 24 horas.` },
];

export function NotificationsProvider({ children }) {
  const { tasks } = useTasks();

  const [list, setList] = useState(() => readJSON(LIST_KEY, []));
  const [prefs, setPrefsState] = useState(() => ({ tasks: true, pomodoro: true, ...readJSON(PREFS_KEY, {}) }));

  const listRef = useRef(list);
  const prefsRef = useRef(prefs);
  const tasksRef = useRef(tasks);
  prefsRef.current = prefs;
  tasksRef.current = tasks;

  const commit = useCallback((next) => {
    listRef.current = next;
    setList(next);
    writeJSON(LIST_KEY, next);
  }, []);

  const pushBrowserNotif = (title, msg, urgency) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    try {
      const icons = { 1: '🔴', 2: '🟠', 3: '🟡', 4: '🟢' };
      new Notification(`${icons[urgency] || '🔔'} ${title}`, {
        body: msg,
        tag: `sf-${urgency}-${Date.now()}`,
      });
    } catch {
      /* algunos navegadores bloquean el constructor */
    }
  };

  const add = useCallback(
    ({ title, msg, urgency = 0, taskId = null, icon = 'ri-notification-3-line' }) => {
      // Anti-duplicado: misma notificación (título + mensaje) en los últimos 60 s.
      const dup = listRef.current.find(
        (n) => n.title === title && n.msg === msg && Date.now() - n.timestamp < 60000,
      );
      if (dup) return;

      const n = {
        id: Date.now() + Math.random(),
        title,
        msg,
        urgency,
        taskId,
        icon,
        read: false,
        timestamp: Date.now(),
      };
      commit([n, ...listRef.current].slice(0, MAX_ITEMS));
      pushBrowserNotif(title, msg, urgency);
    },
    [commit],
  );

  const checkDueDates = useCallback(() => {
    if (!prefsRef.current.tasks) return;
    const current = tasksRef.current;
    if (!current.length) return;

    const now = Date.now();
    const fired = readJSON(FIRED_KEY, {});
    let changed = false;

    current.forEach((task) => {
      if (task.done || !task.dueDate) return;
      const hours = (new Date(task.dueDate).getTime() - now) / 3600000;
      const match = THRESHOLDS.find((t) => t.test(hours));
      if (!match) return;

      const fireKey = `${task._id}:${match.key}`;
      if (fired[fireKey]) return;

      add({ title: '🔔 Recordatorio de Tarea', msg: match.text(task), urgency: match.urgency, taskId: task._id });
      fired[fireKey] = now;
      changed = true;
    });

    // Limpia registros de tareas que ya no existen o de más de 7 días.
    const validIds = new Set(current.map((t) => t._id));
    Object.keys(fired).forEach((k) => {
      const taskId = k.split(':')[0];
      if (!validIds.has(taskId) || now - fired[k] > 7 * DAY_MS) {
        delete fired[k];
        changed = true;
      }
    });

    if (changed) writeJSON(FIRED_KEY, fired);
  }, [add]);

  // Revisa vencimientos cuando cambian las tareas y luego cada 5 minutos.
  useEffect(() => {
    checkDueDates();
  }, [tasks, prefs.tasks, checkDueDates]);

  useEffect(() => {
    const id = setInterval(checkDueDates, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [checkDueDates]);

  // Pide permiso para las notificaciones del navegador al iniciar (como antes).
  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') Notification.requestPermission().catch(() => {});
  }, []);

  const markRead = useCallback(
    (id) => commit(listRef.current.map((n) => (n.id === id ? { ...n, read: true } : n))),
    [commit],
  );
  const markAllRead = useCallback(
    () => commit(listRef.current.map((n) => ({ ...n, read: true }))),
    [commit],
  );
  const clear = useCallback(() => commit([]), [commit]);

  const setPref = useCallback((key, value) => {
    setPrefsState((prev) => {
      const next = { ...prev, [key]: value };
      writeJSON(PREFS_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      list,
      unreadCount: list.filter((n) => !n.read).length,
      prefs,
      setPref,
      add,
      markRead,
      markAllRead,
      clear,
    }),
    [list, prefs, setPref, add, markRead, markAllRead, clear],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications debe usarse dentro de <NotificationsProvider>');
  return ctx;
}

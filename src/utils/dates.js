/* ============================================================
   StudyFlow+ — utils/dates.js
   Fechas SIEMPRE en hora local (la versión anterior usaba
   toISOString(), que es UTC y adelantaba un día las tareas de la
   noche en Ecuador, UTC-5).
   ============================================================ */

const pad = (n) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' en hora local. */
export function dateKey(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
}

export const todayKey = () => dateKey(new Date());

/** Convierte 'YYYY-MM-DD' en una fecha local (no UTC). */
export function parseLocalDate(key) {
  const [y, m, d] = String(key).split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Suma días a un 'YYYY-MM-DD' y devuelve otro 'YYYY-MM-DD'. */
export function addDaysToKey(key, days) {
  const d = parseLocalDate(key);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

/** Valor para <input type="datetime-local"> en hora local. */
export function toLocalInput(date) {
  const d = new Date(date);
  return `${dateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const fmtDayMonth = (d) =>
  new Date(d).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });

/** Lunes 00:00 → domingo 23:59 de la semana de `date`. */
export function weekRange(date) {
  const d = new Date(date);
  const dow = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - dow);
  d.setHours(0, 0, 0, 0);
  const start = new Date(d);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return { start, end: new Date(d) };
}

/** Mueve `date` N meses sin desbordar (31 ene + 1 mes = 28/29 feb, no 3 mar). */
export function addMonths(date, delta) {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + delta);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return d;
}

/** Etiqueta y clase CSS del vencimiento de una tarea. */
export function dueLabel(dateStr) {
  const diff = new Date(dateStr) - new Date();
  const h = diff / 3600000;
  if (diff < 0) return { label: 'Vencida', cls: 'due-urgent1' };
  if (h <= 1) return { label: 'En 1h', cls: 'due-urgent2' };
  if (h <= 24) return { label: 'Hoy', cls: 'due-urgent2' };
  if (h <= 72) return { label: `En ${Math.round(h / 24)}d`, cls: 'due-urgent3' };
  return { label: fmtDayMonth(dateStr), cls: '' };
}

export function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'Hace un momento';
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  return `Hace ${Math.floor(h / 24)} días`;
}

export function formatMs(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${pad(h)}:${pad(m)}:${pad(s % 60)}`;
}

export function formatClock(totalSeconds) {
  return `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`;
}

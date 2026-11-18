/* ============================================================
   StudyFlow+ — services/api.js
   Capa de acceso al backend Express/MongoDB (misma API de siempre).
   ============================================================ */

// En desarrollo se usa el proxy de Vite (/api). En producción, el backend de Render.
// Se puede cambiar con VITE_API_URL en un archivo .env.
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'https://studyflow2-0.onrender.com/api');

const TOKEN_KEY = 'sf_jwt_token';
const USER_KEY = 'sf_user';

/* ── Sesión (token + usuario en localStorage) ── */

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export const setUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));

export const isLoggedIn = () => !!getToken() && !!getUser();

/* ── Petición genérica ── */

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const resp = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) throw new Error(data.message || `Error ${resp.status}`);
  return data;
}

function storeSession(data) {
  if (data.token) setToken(data.token);
  if (data.user) setUser(data.user);
  return data;
}

/* ── Auth ── */

export const login = async (email, password) =>
  storeSession(
    await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  );

export const register = async (name, email, password) =>
  storeSession(
    await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  );

export async function getProfile() {
  const data = await request('/auth/profile', { method: 'GET' });
  if (data.user) setUser(data.user);
  return data;
}

export async function updateProfile(profileData) {
  const data = await request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  if (data.user) setUser(data.user);
  return data;
}

export const syncStats = (statsData) =>
  request('/auth/sync-stats', { method: 'POST', body: JSON.stringify(statsData) });

/* ── Tareas ── */

export const getTasks = () => request('/tasks', { method: 'GET' });
export const createTask = (task) =>
  request('/tasks', { method: 'POST', body: JSON.stringify(task) });
export const updateTask = (id, data) =>
  request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });

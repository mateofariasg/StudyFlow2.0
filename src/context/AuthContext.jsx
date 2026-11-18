import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/api.js';

const AuthContext = createContext(null);

const STAT_KEYS = ['minutes', 'pomodoros', 'sessions', 'xp'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (api.isLoggedIn() ? api.getUser() : null));
  const loggedIn = !!user;

  // Mantiene sf_user sincronizado con el estado.
  useEffect(() => {
    if (user) api.setUser(user);
  }, [user]);

  // Al entrar (o al abrir la app con sesión) refresca el perfil desde el servidor.
  useEffect(() => {
    if (!loggedIn) return;
    api
      .getProfile()
      .then((data) => data.user && setUser(data.user))
      .catch(() => {});
  }, [loggedIn]);

  const login = useCallback(async (email, password) => {
    await api.login(email, password);
    setUser(api.getUser());
  }, []);

  const register = useCallback(async (name, email, password) => {
    await api.register(name, email, password);
    setUser(api.getUser());
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    setUser(null);
  }, []);

  const confirmLogout = useCallback(() => {
    if (window.confirm('¿Cerrar sesión?')) logout();
  }, [logout]);

  const updateProfile = useCallback(async (data) => {
    await api.updateProfile(data);
    setUser(api.getUser());
  }, []);

  /** Suma estadísticas en el servidor y, si sale bien, también en la copia local. */
  const syncStats = useCallback(async (delta) => {
    try {
      await api.syncStats(delta);
      setUser((prev) => {
        if (!prev) return prev;
        const stats = { ...(prev.stats || {}) };
        STAT_KEYS.forEach((k) => {
          if (delta[k]) stats[k] = (stats[k] || 0) + delta[k];
        });
        return { ...prev, stats };
      });
    } catch {
      /* igual que antes: si falla la sincronización no se interrumpe al usuario */
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoggedIn: loggedIn, login, register, logout, confirmLogout, updateProfile, syncStats }),
    [user, loggedIn, login, register, logout, confirmLogout, updateProfile, syncStats],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

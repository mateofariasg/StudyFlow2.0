import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useToast } from './ToastContext.jsx';

const KEY = 'sf_theme';
const ThemeContext = createContext(null);

function readInitial() {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  } catch {
    return 'dark';
  }
}

export function ThemeProvider({ children }) {
  const toast = useToast();
  const [theme, setThemeState] = useState(readInitial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* sin almacenamiento disponible */
    }
  }, [theme]);

  const setTheme = useCallback(
    (next) => {
      const value = next === 'light' ? 'light' : 'dark';
      if (value === theme) return;
      setThemeState(value);
      toast.info(`Tema cambiado a ${value === 'light' ? 'modo claro ☀️' : 'modo oscuro 🌙'}`);
    },
    [theme, toast],
  );

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light') }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}

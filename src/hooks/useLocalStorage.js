import { useCallback, useState } from 'react';

/**
 * useState que se guarda en localStorage (solo escribe cuando algo cambia,
 * no al montar). Acepta un valor o una función, igual que useState.
 */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) return JSON.parse(raw);
    } catch {
      /* JSON dañado: se usa el valor inicial */
    }
    return typeof initial === 'function' ? initial() : initial;
  });

  const set = useCallback(
    (updater) => {
      setValue((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* sin almacenamiento disponible */
        }
        return next;
      });
    },
    [key],
  );

  return [value, set];
}

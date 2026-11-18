import { useEffect, useRef } from 'react';

/**
 * Cuenta regresiva basada en una hora de fin (no en "restar 1 cada segundo"),
 * así no se atrasa cuando la pestaña queda en segundo plano.
 *
 *  - running:      si está corriendo
 *  - remaining:    segundos restantes (estado del padre)
 *  - setRemaining: setter del estado
 *  - onComplete:   se llama una vez al llegar a 0
 */
export function useCountdown({ running, remaining, setRemaining, onComplete }) {
  const remainingRef = useRef(remaining);
  const completeRef = useRef(onComplete);
  remainingRef.current = remaining;
  completeRef.current = onComplete;

  useEffect(() => {
    if (!running) return undefined;
    const endAt = Date.now() + remainingRef.current * 1000;

    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        completeRef.current();
      }
    }, 250);

    return () => clearInterval(id);
  }, [running, setRemaining]);
}

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useCountdown } from '../hooks/useCountdown.js';
import { useAuth } from './AuthContext.jsx';
import { useNotifications } from './NotificationsContext.jsx';
import { dateKey, todayKey } from '../utils/dates.js';

/* ============================================================
   Estado del Centro de Concentración (Pomodoro + Cronómetro).
   Vive en un contexto para que el temporizador siga corriendo
   aunque el usuario cambie de vista.
   ============================================================ */

const HISTORY_KEY = 'sf_focus_history';
const DEFAULT_CFG = { work: 25, short: 5, long: 15, autoSwitch: true };

const TimerContext = createContext(null);

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 100)));
  } catch {
    /* sin almacenamiento disponible */
  }
}

export function TimerProvider({ children }) {
  const { syncStats } = useAuth();
  const { add: addNotification, prefs } = useNotifications();

  /* ─── Pomodoro ─── */
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [phase, setPhase] = useState('work'); // 'work' | 'short' | 'long'
  const [remaining, setRemaining] = useState(DEFAULT_CFG.work * 60);
  const [running, setRunning] = useState(false);
  const [completedPomos, setCompletedPomos] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [sessions, setSessions] = useState(loadHistory);
  const sessionStart = useRef(Date.now());

  /* ─── Cronómetro ─── */
  const [elapsed, setElapsed] = useState(0);
  const [chronoRunning, setChronoRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const elapsedRef = useRef(0);
  elapsedRef.current = elapsed;

  const totalSeconds = (phase === 'work' ? cfg.work : phase === 'short' ? cfg.short : cfg.long) * 60;

  const goToNextPhase = useCallback(
    (from, completed) => {
      if (from === 'work') {
        const isLong = completed > 0 && completed % 4 === 0;
        setPhase(isLong ? 'long' : 'short');
        setRemaining((isLong ? cfg.long : cfg.short) * 60);
      } else {
        setPhase('work');
        setRemaining(cfg.work * 60);
      }
    },
    [cfg],
  );

  const onPhaseComplete = () => {
    setRunning(false);

    if (phase === 'work') {
      const mins = cfg.work;
      const nextCompleted = completedPomos + 1;
      setCompletedPomos(nextCompleted);
      setCycles((c) => (c + 1) % 4);

      const session = {
        type: 'pomodoro',
        phase: 'work',
        duration: mins,
        startedAt: sessionStart.current,
        completedAt: Date.now(),
      };
      setSessions((prev) => {
        const next = [session, ...prev].slice(0, 100);
        saveHistory(next);
        return next;
      });

      syncStats({ minutes: mins, pomodoros: 1, sessions: 1, xp: 50 });

      if (prefs.pomodoro) {
        addNotification({
          title: '🍅 Pomodoro completado',
          msg: `Completaste ${mins} minutos de estudio. ¡Excelente! Es hora de descansar.`,
          urgency: 4,
        });
      }
      if (cfg.autoSwitch) goToNextPhase('work', nextCompleted);
    } else {
      if (prefs.pomodoro) {
        addNotification({
          title: '⏰ Descanso terminado',
          msg: 'El descanso ha terminado. ¿Listo para otro pomodoro?',
          urgency: 3,
        });
      }
      if (cfg.autoSwitch) goToNextPhase(phase, completedPomos);
    }
  };

  useCountdown({ running, remaining, setRemaining, onComplete: onPhaseComplete });

  const start = useCallback(() => {
    if (running) return;
    sessionStart.current = Date.now();
    setRunning(true);
  }, [running]);

  const pause = useCallback(() => setRunning(false), []);

  const reset = useCallback(() => {
    setRunning(false);
    setPhase('work');
    setRemaining(cfg.work * 60);
  }, [cfg.work]);

  const skip = useCallback(() => {
    setRunning(false);
    goToNextPhase(phase, completedPomos);
  }, [goToNextPhase, phase, completedPomos]);

  const applyConfig = useCallback(({ work, short, long }) => {
    setCfg({ work, short, long, autoSwitch: true });
    setRunning(false);
    setPhase('work');
    setRemaining(work * 60);
  }, []);

  /* ─── Cronómetro ─── */
  useEffect(() => {
    if (!chronoRunning) return undefined;
    const startMs = Date.now() - elapsedRef.current;
    const id = setInterval(() => setElapsed(Date.now() - startMs), 100);
    return () => clearInterval(id);
  }, [chronoRunning]);

  const chronoStart = useCallback(() => setChronoRunning(true), []);
  const chronoPause = useCallback(() => setChronoRunning(false), []);
  const chronoReset = useCallback(() => {
    setChronoRunning(false);
    setElapsed(0);
    setLaps([]);
  }, []);
  const chronoLap = useCallback(() => {
    if (chronoRunning) setLaps((l) => [...l, elapsedRef.current]);
  }, [chronoRunning]);

  /* ─── Historial ─── */
  const clearHistory = useCallback(() => {
    setSessions([]);
    saveHistory([]);
  }, []);

  const today = useMemo(() => {
    const key = todayKey();
    const list = sessions.filter((s) => dateKey(s.completedAt) === key);
    return {
      pomodoros: list.filter((s) => s.type === 'pomodoro').length,
      minutes: list.reduce((acc, s) => acc + (s.duration || 0), 0),
      sessions: list.length,
    };
  }, [sessions]);

  const value = useMemo(
    () => ({
      cfg,
      phase,
      remaining,
      totalSeconds,
      running,
      cycles,
      completedPomos,
      start,
      pause,
      reset,
      skip,
      applyConfig,
      elapsed,
      chronoRunning,
      laps,
      chronoStart,
      chronoPause,
      chronoReset,
      chronoLap,
      sessions,
      today,
      clearHistory,
    }),
    [
      cfg, phase, remaining, totalSeconds, running, cycles, completedPomos, start, pause, reset, skip,
      applyConfig, elapsed, chronoRunning, laps, chronoStart, chronoPause, chronoReset, chronoLap,
      sessions, today, clearHistory,
    ],
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer debe usarse dentro de <TimerProvider>');
  return ctx;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const CONFIG = {
  success: { icon: 'ri-checkbox-circle-fill', color: 'var(--toast-success)', label: 'Éxito' },
  error: { icon: 'ri-close-circle-fill', color: 'var(--toast-error)', label: 'Error' },
  warning: { icon: 'ri-error-warning-fill', color: 'var(--toast-warning)', label: 'Advertencia' },
  info: { icon: 'ri-information-fill', color: 'var(--toast-info)', label: 'Información' },
};

const ToastContext = createContext(null);

function ToastItem({ toast, onDismiss }) {
  const cfg = CONFIG[toast.type] || CONFIG.info;
  const [shown, setShown] = useState(false);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  // Entrada animada
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Cierre automático
  useEffect(() => {
    if (toast.duration <= 0) return undefined;
    timer.current = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer.current);
  }, [toast.id, toast.duration, onDismiss]);

  const handleEnter = () => {
    clearTimeout(timer.current);
    setPaused(true);
  };
  const handleLeave = () => {
    setPaused(false);
    if (toast.duration > 0) {
      timer.current = setTimeout(() => onDismiss(toast.id), 1500);
    }
  };

  const stateClass = toast.leaving ? 'sf-toast-out' : shown ? 'sf-toast-in' : '';

  return (
    <div
      className={`sf-toast sf-toast-${toast.type} ${stateClass}`}
      style={{ '--toast-accent': cfg.color }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      role="status"
    >
      <div className="sf-toast-icon">
        <i className={cfg.icon} />
      </div>
      <div className="sf-toast-body">
        <div className="sf-toast-title">{toast.title || cfg.label}</div>
        <div className="sf-toast-msg">{toast.msg}</div>
      </div>
      <button className="sf-toast-close" aria-label="Cerrar" onClick={() => onDismiss(toast.id)}>
        <i className="ri-close-line" />
      </button>
      {toast.duration > 0 && (
        <div
          className="sf-toast-progress"
          style={{
            transition: paused ? 'none' : `transform ${toast.duration}ms linear`,
            transform: shown ? 'scaleX(0)' : 'scaleX(1)',
          }}
        />
      )}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 320);
  }, []);

  const show = useCallback((type = 'info', msg = '', title = null, duration = 4000) => {
    const id = ++counter.current;
    setToasts((list) => [...list, { id, type, msg: msg == null ? '' : String(msg), title, duration }]);
    return id;
  }, []);

  const api = useMemo(
    () => ({
      show,
      dismiss,
      success: (msg, title) => show('success', msg, title),
      error: (msg, title) => show('error', msg, title),
      warning: (msg, title) => show('warning', msg, title),
      info: (msg, title) => show('info', msg, title),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="sf-toast-container" id="sf-toast-container">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}

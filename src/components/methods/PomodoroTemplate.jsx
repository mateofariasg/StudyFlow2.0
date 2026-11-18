import { useEffect, useRef, useState } from 'react';
import { useMethodData } from '../../hooks/useMethodData.js';
import { useCountdown } from '../../hooks/useCountdown.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatClock } from '../../utils/dates.js';

const CFG = { work: 25, short: 5, long: 15 };
const PHASE_LABELS = { work: 'Sesión de estudio', short: 'Descanso corto', long: 'Descanso largo' };

export default function PomodoroTemplate({ onSaved }) {
  const { data, update, saveNow } = useMethodData('pomodoro', onSaved);
  const { syncStats } = useAuth();
  const { add: addNotification } = useNotifications();
  const toast = useToast();

  const [phase, setPhase] = useState('work');
  const [remaining, setRemaining] = useState(CFG.work * 60);
  const [running, setRunning] = useState(false);

  // Guarda siempre la última versión de los datos para el callback de fin de fase.
  const dataRef = useRef(data);
  dataRef.current = data;

  const onComplete = () => {
    setRunning(false);
    if (phase === 'work') {
      const completed = (dataRef.current.completed || 0) + 1;
      const isLong = completed % 4 === 0;
      saveNow((d) => ({
        ...d,
        completed,
        minutes: (d.minutes || 0) + CFG.work,
        shorts: (d.shorts || 0) + (isLong ? 0 : 1),
        longs: (d.longs || 0) + (isLong ? 1 : 0),
      }));
      // Evento real: se sincroniza con el backend una sola vez.
      syncStats({ minutes: CFG.work, pomodoros: 1, sessions: 1, xp: 50 });
      setPhase(isLong ? 'long' : 'short');
      setRemaining((isLong ? CFG.long : CFG.short) * 60);
      toast.success('¡Pomodoro completado! Hora de descansar 🎉');
      addNotification({
        title: '🍅 Pomodoro completado',
        msg: `${CFG.work} minutos de enfoque. Toma un descanso.`,
        urgency: 4,
      });
    } else {
      setPhase('work');
      setRemaining(CFG.work * 60);
      toast.info('Descanso terminado. ¿Listo para otra sesión?');
    }
  };

  useCountdown({ running, remaining, setRemaining, onComplete });

  // Si se cierra la plantilla mientras corre, el temporizador se detiene solo (se desmonta el hook).
  useEffect(() => () => setRunning(false), []);

  const reset = () => {
    setRunning(false);
    setPhase('work');
    setRemaining(CFG.work * 60);
  };

  return (
    <>
      <div className="mt-intro">
        Temporizador enfocado con registro de productividad. Tu sesión se guarda automáticamente.
      </div>
      <div className="pomo-template">
        <div className="pomo-template-timer">
          <div className="pomo-tpl-time" id="ptpl-time">{formatClock(remaining)}</div>
          <div className="pomo-tpl-phase" id="ptpl-phase">{PHASE_LABELS[phase]}</div>
          <div className="timer-controls" style={{ justifyContent: 'center', marginTop: 16 }}>
            <button className="timer-btn tbtn-reset" id="ptpl-reset" onClick={reset}>
              <i className="ri-refresh-line" />
            </button>
            <button className={`timer-btn tbtn-start${running ? ' hidden' : ''}`} id="ptpl-start" onClick={() => setRunning(true)}>
              <i className="ri-play-fill" />
            </button>
            <button className={`timer-btn tbtn-pause${running ? '' : ' hidden'}`} id="ptpl-pause" onClick={() => setRunning(false)}>
              <i className="ri-pause-fill" />
            </button>
          </div>
        </div>
        <div className="pomo-template-stats">
          <div className="mt-stat"><div className="mt-stat-val">{data.completed || 0}</div><div className="mt-stat-lbl">Sesiones completadas</div></div>
          <div className="mt-stat"><div className="mt-stat-val">{data.shorts || 0}</div><div className="mt-stat-lbl">Descansos cortos</div></div>
          <div className="mt-stat"><div className="mt-stat-val">{data.longs || 0}</div><div className="mt-stat-lbl">Descansos largos</div></div>
          <div className="mt-stat"><div className="mt-stat-val">{data.minutes || 0}</div><div className="mt-stat-lbl">Minutos enfocados</div></div>
        </div>
      </div>
      <div className="mt-field">
        <label>📋 Registro de productividad — ¿en qué trabajaste?</label>
        <textarea
          id="ptpl-log"
          className="field-input"
          rows="3"
          placeholder="Ej: Repasé el capítulo 3 de Biología..."
          value={data.log || ''}
          onChange={(e) => update({ log: e.target.value })}
        />
      </div>
    </>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTimer } from '../context/TimerContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatClock, formatMs } from '../utils/dates.js';

const RING_CIRCUMFERENCE = 597; // 2π · 95
const PHASE_LABELS = { work: 'Sesión de Estudio', short: 'Descanso Corto', long: 'Descanso Largo' };

export default function ConcentrationView() {
  const t = useTimer();
  const { user } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState('pomodoro'); // 'pomodoro' | 'chrono'
  const [form, setForm] = useState({ work: t.cfg.work, short: t.cfg.short, long: t.cfg.long });

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const applyConfig = () => {
    t.applyConfig({
      work: parseInt(form.work, 10) || 25,
      short: parseInt(form.short, 10) || 5,
      long: parseInt(form.long, 10) || 15,
    });
    toast.success('Configuración aplicada.');
  };

  const clearHistory = () => {
    if (window.confirm('¿Limpiar el historial de sesiones?')) t.clearHistory();
  };

  const ringOffset = RING_CIRCUMFERENCE * (1 - t.remaining / t.totalSeconds);

  return (
    <>
      <div className="view-title">🎯 Centro de Concentración</div>
      <div className="view-subtitle">Mantén el enfoque. Estudia con intención.</div>

      <div className="concentration-grid">
        {/* Tarjeta del temporizador */}
        <div className="timer-card">
          <div className="mode-tabs" id="timer-mode-tabs">
            <button className={`mtab${mode === 'pomodoro' ? ' active' : ''}`} onClick={() => setMode('pomodoro')}>
              <i className="ri-timer-flash-line" /> Pomodoro
            </button>
            <button className={`mtab${mode === 'chrono' ? ' active' : ''}`} onClick={() => setMode('chrono')}>
              <i className="ri-stopwatch-line" /> Cronómetro
            </button>
          </div>

          {/* POMODORO */}
          <div id="pomo-section" className={mode === 'pomodoro' ? '' : 'hidden'}>
            <div className="timer-ring-wrap">
              <svg className="timer-ring" viewBox="0 0 220 220">
                <circle className="ring-track" cx="110" cy="110" r="95" />
                <circle
                  className={`ring-fill${t.phase === 'work' ? '' : ' break'}`}
                  id="ring-fill"
                  cx="110"
                  cy="110"
                  r="95"
                  style={{ strokeDasharray: RING_CIRCUMFERENCE, strokeDashoffset: ringOffset }}
                />
              </svg>
              <div className="timer-center">
                <div className="timer-time" id="pomo-display">{formatClock(t.remaining)}</div>
                <div className="timer-label" id="pomo-label">{PHASE_LABELS[t.phase]}</div>
              </div>
            </div>

            <div className="pomodoro-cycles" id="pomo-cycles">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`pomo-dot${i < t.cycles % 4 ? ' done' : ''}`} title={`Pomodoro ${i + 1}`} />
              ))}
            </div>

            <div className="timer-controls">
              <button className="timer-btn tbtn-reset" id="pomo-reset" title="Reiniciar" onClick={t.reset}>
                <i className="ri-refresh-line" />
              </button>
              <button className={`timer-btn tbtn-start${t.running ? ' hidden' : ''}`} id="pomo-start" title="Iniciar" onClick={t.start}>
                <i className="ri-play-fill" />
              </button>
              <button className={`timer-btn tbtn-pause${t.running ? '' : ' hidden'}`} id="pomo-pause" title="Pausar" onClick={t.pause}>
                <i className="ri-pause-fill" />
              </button>
              <button
                className="timer-btn tbtn-reset"
                id="pomo-skip"
                title="Saltar fase"
                style={{ background: 'var(--bg-surface-3)' }}
                onClick={t.skip}
              >
                <i className="ri-skip-forward-line" />
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              🍅 Pomodoros hoy:{' '}
              <span id="pomo-count-today" style={{ color: 'var(--accent)', fontWeight: 600 }}>{t.today.pomodoros}</span>
            </div>
          </div>

          {/* CRONÓMETRO */}
          <div id="chrono-section" className={mode === 'chrono' ? '' : 'hidden'}>
            <div className="chrono-display">
              <div className="chrono-time" id="chrono-display">{formatMs(t.elapsed)}</div>
              <div className="timer-controls">
                <button className="timer-btn tbtn-reset" id="chrono-reset" title="Reiniciar" onClick={t.chronoReset}>
                  <i className="ri-refresh-line" />
                </button>
                <button className={`timer-btn tbtn-start${t.chronoRunning ? ' hidden' : ''}`} id="chrono-start" onClick={t.chronoStart}>
                  <i className="ri-play-fill" />
                </button>
                <button className={`timer-btn tbtn-pause${t.chronoRunning ? '' : ' hidden'}`} id="chrono-pause" onClick={t.chronoPause}>
                  <i className="ri-pause-fill" />
                </button>
                <button
                  className="timer-btn tbtn-reset"
                  id="chrono-lap"
                  title="Vuelta"
                  style={{ background: 'var(--bg-surface-3)', fontSize: '0.75rem' }}
                  onClick={t.chronoLap}
                >
                  Vuelta
                </button>
              </div>
              <div className="chrono-laps" id="chrono-laps">
                {t.laps.map((lap, i) => (
                  <div className="lap-item" key={i}>
                    <span className="lap-n">Vuelta {i + 1}</span>
                    <span className="lap-t">{formatMs(lap)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div className="card" style={{ width: '100%' }}>
            <div className="card-header">
              <h3><i className="ri-settings-3-line" /> Configuración</h3>
            </div>
            <div className="form-row">
              <div className="field-group">
                <label>Trabajo (min)</label>
                <input className="field-input" type="number" id="cfg-work" min="1" max="90" value={form.work} onChange={setField('work')} />
              </div>
              <div className="field-group">
                <label>Descanso corto</label>
                <input className="field-input" type="number" id="cfg-short" min="1" max="30" value={form.short} onChange={setField('short')} />
              </div>
              <div className="field-group">
                <label>Descanso largo</label>
                <input className="field-input" type="number" id="cfg-long" min="1" max="60" value={form.long} onChange={setField('long')} />
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <button className="btn-secondary" id="save-timer-cfg" style={{ width: '100%' }} onClick={applyConfig}>
                Aplicar configuración
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas e historial */}
        <div className="gap-section">
          <div className="card">
            <div className="card-header">
              <h3><i className="ri-bar-chart-2-line" /> Estadísticas de Hoy</h3>
            </div>
            <div className="focus-stats-grid">
              <div className="focus-stat">
                <div className="focus-stat-val" id="stat-pomo-today">{t.today.pomodoros}</div>
                <div className="focus-stat-lbl">Pomodoros</div>
              </div>
              <div className="focus-stat">
                <div className="focus-stat-val" id="stat-min-today">{t.today.minutes}</div>
                <div className="focus-stat-lbl">Minutos</div>
              </div>
              <div className="focus-stat">
                <div className="focus-stat-val" id="stat-sessions-today">{t.today.sessions}</div>
                <div className="focus-stat-lbl">Sesiones</div>
              </div>
              <div className="focus-stat">
                <div className="focus-stat-val" id="stat-streak-focus">{user?.stats?.streak || 0}</div>
                <div className="focus-stat-lbl">Racha (días)</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3><i className="ri-history-line" /> Historial de Sesiones</h3>
              <button className="btn-text-sm" id="clear-history-btn" onClick={clearHistory}>Limpiar</button>
            </div>
            <div id="session-history-list">
              {t.sessions.length === 0 ? (
                <div className="empty-state" style={{ padding: 20 }}>
                  <i className="ri-timer-line" />
                  <p>Sin sesiones registradas</p>
                </div>
              ) : (
                t.sessions.slice(0, 10).map((s) => (
                  <div className="session-item" key={`${s.completedAt}-${s.startedAt}`}>
                    <div className="session-icon"><i className="ri-focus-3-line" /></div>
                    <div className="session-info">
                      <div className="session-name">{s.type === 'pomodoro' ? '🍅 Pomodoro' : '⏱ Cronómetro'}</div>
                      <div className="session-sub">
                        {new Date(s.completedAt).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="session-dur">{s.duration} min</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

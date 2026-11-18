import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTasks } from '../context/TasksContext.jsx';
import TaskList from '../components/TaskList.jsx';
import { dateKey, fmtDayMonth, todayKey } from '../utils/dates.js';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const PRIORITY_COLORS = { alta: 'var(--red)', media: 'var(--yellow)', baja: 'var(--green)' };

/** Tareas completadas por día de la semana actual (lunes a domingo). */
function buildWeek(tasks) {
  const todayDow = (new Date().getDay() + 6) % 7;
  const monday = new Date();
  monday.setDate(monday.getDate() - todayDow);
  monday.setHours(0, 0, 0, 0);

  const counts = DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const key = dateKey(d);
    return tasks.filter((t) => t.done && t.dueDate && dateKey(t.dueDate) === key).length;
  });
  const max = Math.max(...counts, 1);

  return DAYS.map((label, i) => ({
    label,
    count: counts[i],
    height: Math.max(8, Math.round((counts[i] / max) * 72)),
    isToday: i === todayDow,
  }));
}

export default function DashboardView() {
  const { user } = useAuth();
  const { tasks, loading, openTaskModal } = useTasks();
  const navigate = useNavigate();

  const stats = user?.stats || {};

  const { pending, completedCount, listTasks, week, recent } = useMemo(() => {
    const pendingTasks = tasks.filter((t) => !t.done);
    const today = todayKey();
    const todayTasks = tasks.filter((t) => t.dueDate && dateKey(t.dueDate) === today);
    return {
      pending: pendingTasks,
      completedCount: tasks.filter((t) => t.done).length, // derivado del estado real
      listTasks: todayTasks.length > 0 ? todayTasks : pendingTasks,
      week: buildWeek(tasks),
      recent: tasks.filter((t) => t.done).slice(0, 5),
    };
  }, [tasks]);

  if (loading) return <div className="spinner" />;

  const hours = Math.round(((stats.minutes || 0) / 60) * 10) / 10;
  const firstName = user?.name ? user.name.split(' ')[0] : '';

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon si-purple"><i className="ri-timer-flash-line" /></div>
          <div className="stat-info">
            <h3>Tiempo de Enfoque</h3>
            <div className="stat-number">{hours}<span className="stat-unit"> hrs</span></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-orange"><i className="ri-focus-3-line" /></div>
          <div className="stat-info">
            <h3>Pomodoros</h3>
            <div className="stat-number">{stats.pomodoros || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-green"><i className="ri-checkbox-circle-line" /></div>
          <div className="stat-info">
            <h3>Tareas Completadas</h3>
            <div className="stat-number">{completedCount}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-blue"><i className="ri-fire-line" /></div>
          <div className="stat-info">
            <h3>Racha Actual</h3>
            <div className="stat-number">{stats.streak || 0}<span className="stat-unit"> días</span></div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Columna izquierda */}
        <div className="dashboard-col">
          <div className="card">
            <div className="card-header">
              <h2><i className="ri-task-line" /> Tareas de Hoy</h2>
              <button
                className="btn-primary"
                id="dash-new-task"
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={() => openTaskModal()}
              >
                <i className="ri-add-line" /> Nueva
              </button>
            </div>
            <div id="dash-tasks-list">
              <TaskList tasks={listTasks} />
            </div>
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <button
                className="btn-secondary"
                id="dash-see-all"
                style={{ fontSize: '0.8rem', padding: '7px 20px', width: '100%' }}
                onClick={() => navigate('/planner')}
              >
                Ver todas las tareas <i className="ri-arrow-right-line" />
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2><i className="ri-bar-chart-grouped-line" /> Progreso Semanal</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tareas completadas</span>
            </div>
            <div className="week-bars" id="week-bars-container">
              {week.map((d) => (
                <div className="week-bar-wrap" key={d.label}>
                  <div
                    className={`week-bar${d.isToday ? ' today' : ''}`}
                    style={{ height: d.height }}
                    title={`${d.label}: ${d.count} tareas`}
                  />
                  <span className="week-bar-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="dashboard-col">
          <div className="card">
            <div className="card-header">
              <h2><i className="ri-pulse-line" /> Actividad Reciente</h2>
            </div>
            <div id="dash-activity">
              {recent.length === 0 ? (
                <div className="empty-state" style={{ padding: 20 }}>
                  <i className="ri-calendar-line" />
                  <p>Sin actividad reciente</p>
                </div>
              ) : (
                recent.map((t) => (
                  <div className="activity-item" key={t._id}>
                    <div className="activity-dot" style={{ background: PRIORITY_COLORS[t.priority] || 'var(--accent)' }} />
                    <span className="activity-text">Completaste: {t.text}</span>
                    <span className="activity-time">{t.dueDate ? fmtDayMonth(t.dueDate) : '—'}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2><i className="ri-rocket-line" /> Acceso Rápido</h2>
            </div>
            <div className="quick-actions">
              <button className="quick-action-btn" onClick={() => navigate('/concentration')}>
                <i className="ri-focus-3-line" />
                <span>Iniciar Pomodoro</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/planner')}>
                <i className="ri-calendar-2-line" />
                <span>Planificador</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/study')}>
                <i className="ri-book-open-line" />
                <span>Métodos</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/reading')}>
                <i className="ri-book-2-line" />
                <span>Lecturas</span>
              </button>
            </div>
          </div>

          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.08))',
              borderColor: 'rgba(99,102,241,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: '2.2rem' }}>🎓</div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>
                  {firstName ? `¡Hola, ${firstName}!` : '¡Bienvenido!'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Llevas <strong style={{ color: 'var(--accent)' }}>{stats.xp || 0} XP</strong> acumulados.{' '}
                  {pending.length > 0 ? (
                    <>
                      Tienes <strong style={{ color: 'var(--yellow)' }}>{pending.length} tareas</strong> pendientes.
                    </>
                  ) : (
                    '¡Todas las tareas al día! 🎉'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useNotifications } from '../context/NotificationsContext.jsx';
import { useTimer } from '../context/TimerContext.jsx';

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}

export default function SettingsView() {
  const { user, updateProfile, confirmLogout } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const { prefs, setPref, clear: clearNotifications } = useNotifications();
  const { clearHistory } = useTimer();

  const stats = user?.stats || {};
  const [name, setName] = useState(user?.name || '');
  const [school, setSchool] = useState(user?.settings?.school || '');
  const [saving, setSaving] = useState(false);

  // Si el perfil llega o cambia desde el servidor, se refleja en el formulario.
  useEffect(() => {
    setName(user?.name || '');
    setSchool(user?.settings?.school || '');
  }, [user?.name, user?.settings?.school]);

  const saveProfile = async () => {
    if (!name.trim()) return toast.warning('El nombre no puede estar vacío.');
    setSaving(true);
    try {
      // 'school' se mapea al campo existente settings.school del modelo User.
      await updateProfile({ name: name.trim(), school: school.trim() });
      toast.success('Perfil actualizado correctamente.');
    } catch (e) {
      toast.error(`Error al guardar: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return toast.warning('Tu navegador no admite notificaciones.');
    const p = await Notification.requestPermission().catch(() => 'denied');
    if (p === 'granted') toast.success('Notificaciones del navegador activadas.');
    else toast.warning('Permiso denegado. Actívalas en la configuración del navegador.');
  };

  const handleClearSessions = () => {
    if (window.confirm('¿Limpiar historial de sesiones?')) {
      clearHistory();
      toast.info('Historial de sesiones limpiado.');
    }
  };

  const handleClearNotifs = () => {
    clearNotifications();
    toast.info('Notificaciones limpiadas.');
  };

  const light = theme === 'light';
  const statRow = (label, value, color = 'var(--accent)') => (
    <div className="setting-row">
      <div className="setting-info"><h4>{label}</h4></div>
      <span style={{ color, fontWeight: 600 }}>{value}</span>
    </div>
  );

  return (
    <>
      <div className="view-title">⚙️ Configuración</div>
      <div className="view-subtitle">Personaliza tu experiencia en StudyFlow+.</div>

      <div className="settings-grid">
        <div className="card">
          <div className="card-header"><h3><i className="ri-user-line" /> Perfil</h3></div>
          <div className="field-group" style={{ marginBottom: 12 }}>
            <label>Nombre Completo</label>
            <input className="field-input" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field-group" style={{ marginBottom: 12 }}>
            <label>Unidad Educativa</label>
            <input
              className="field-input"
              type="text"
              placeholder="Ej: Unidad Educativa Fiscal Vicente Rocafuerte"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />
          </div>
          <div className="field-group" style={{ marginBottom: 16 }}>
            <label>Correo</label>
            <input className="field-input" type="email" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={saveProfile} disabled={saving}>
            <i className="ri-save-line" /> {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        <div className="card">
          <div className="card-header"><h3><i className="ri-palette-line" /> Apariencia</h3></div>
          <div className="setting-row">
            <div className="setting-info">
              <h4>{light ? 'Modo Claro' : 'Modo Oscuro'}</h4>
              <p>Cambia entre tema claro y oscuro. Tu preferencia se guarda.</p>
            </div>
            <Toggle checked={light} onChange={(on) => setTheme(on ? 'light' : 'dark')} />
          </div>
          <div className="theme-preview-row">
            <button className={`theme-chip${!light ? ' active' : ''}`} onClick={() => setTheme('dark')}>
              <span className="chip-dot dark" /> Oscuro
            </button>
            <button className={`theme-chip${light ? ' active' : ''}`} onClick={() => setTheme('light')}>
              <span className="chip-dot light" /> Claro
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3><i className="ri-bar-chart-box-line" /> Estadísticas</h3></div>
          {statRow('Tiempo total de enfoque', `${Math.round(((stats.minutes || 0) / 60) * 10) / 10} hrs`)}
          {statRow('Pomodoros completados', stats.pomodoros || 0)}
          {statRow('Sesiones de estudio', stats.sessions || 0)}
          {statRow('Experiencia (XP)', `${stats.xp || 0} XP`, 'var(--purple)')}
        </div>

        <div className="card">
          <div className="card-header"><h3><i className="ri-notification-3-line" /> Notificaciones</h3></div>
          <div className="setting-row">
            <div className="setting-info">
              <h4>Recordatorios de tareas</h4>
              <p>Notificaciones cuando una tarea está por vencer</p>
            </div>
            <Toggle checked={prefs.tasks} onChange={(v) => setPref('tasks', v)} />
          </div>
          <div className="setting-row">
            <div className="setting-info">
              <h4>Fin de Pomodoro</h4>
              <p>Alerta cuando termina un ciclo Pomodoro</p>
            </div>
            <Toggle checked={prefs.pomodoro} onChange={(v) => setPref('pomodoro', v)} />
          </div>
          <div style={{ marginTop: 14 }}>
            <button
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
              onClick={requestPermission}
            >
              <i className="ri-notification-line" /> Activar notificaciones del navegador
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3><i className="ri-database-2-line" /> Datos</h3></div>
          <div className="setting-row">
            <div className="setting-info">
              <h4>Limpiar historial de sesiones</h4>
              <p>Elimina el historial de Pomodoros</p>
            </div>
            <button className="btn-danger" onClick={handleClearSessions}>Limpiar</button>
          </div>
          <div className="setting-row">
            <div className="setting-info">
              <h4>Limpiar notificaciones</h4>
              <p>Vacía el panel de notificaciones</p>
            </div>
            <button className="btn-danger" onClick={handleClearNotifs}>Limpiar</button>
          </div>
          <div className="setting-row" style={{ borderBottom: 'none' }}>
            <div className="setting-info">
              <h4 style={{ color: 'var(--red)' }}>Cerrar Sesión</h4>
              <p>Salir de tu cuenta actual</p>
            </div>
            <button className="btn-danger" onClick={confirmLogout}>Salir</button>
          </div>
        </div>
      </div>
    </>
  );
}

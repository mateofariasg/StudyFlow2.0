import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationsContext.jsx';
import { VIEW_TITLES } from '../config/nav.js';

export default function Header({ onToggleSidebar, onToggleNotifications }) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const debounce = useRef(null);

  const dateText = useMemo(
    () =>
      new Date().toLocaleDateString('es-EC', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  );

  // Buscar en el encabezado lleva al Planificador con el texto ya filtrado.
  useEffect(() => () => clearTimeout(debounce.current), []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      const q = value.trim().toLowerCase();
      if (!q) return;
      navigate(`/planner?q=${encodeURIComponent(q)}`);
    }, 400);
  };

  const initial = user?.name ? user.name[0].toUpperCase() : '?';

  return (
    <header className="content-header">
      <div className="header-left">
        <button className="mobile-toggle" id="mobileToggle" onClick={onToggleSidebar}>
          <i className="ri-menu-line" />
        </button>
        <div>
          <h1 id="page-title">{VIEW_TITLES[pathname] || 'StudyFlow+'}</h1>
          <p className="date-text" id="current-date">{dateText}</p>
        </div>
      </div>
      <div className="header-right">
        <div className="header-search">
          <i className="ri-search-line" />
          <input
            type="text"
            id="global-search"
            placeholder="Buscar tareas..."
            value={query}
            onChange={handleSearch}
          />
        </div>
        <div className="notif-wrap">
          <button className="icon-btn notif-btn" id="notifBtn" title="Notificaciones" onClick={onToggleNotifications}>
            <i className="ri-notification-3-line" />
            <span className={`notif-badge${unreadCount > 0 ? '' : ' hidden'}`} id="notif-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </button>
        </div>
        <div className="header-avatar" id="header-avatar">{initial}</div>
      </div>
    </header>
  );
}

import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { DEV_LINKS, NAV_SECTIONS } from '../config/nav.js';

export default function Sidebar({ open }) {
  const { user, confirmLogout } = useAuth();
  const initial = (user?.name || 'M')[0].toUpperCase();

  return (
    <aside className={`sidebar${open ? ' open' : ''}`} id="sidebar">
      <div className="sidebar-top">
        <div className="logo">
          <div className="logo-icon"><i className="ri-flashlight-fill" /></div>
          <span className="logo-text">StudyFlow<span className="brand-plus">+</span></span>
        </div>
      </div>

      <nav className="menu">
        {NAV_SECTIONS.map((section) => (
          <Fragment key={section.label}>
            <span className="menu-label">{section.label}</span>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}
              >
                <i className={item.icon} /><span>{item.label}</span>
              </NavLink>
            ))}
          </Fragment>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-row" id="user-row">
          <div className="user-avatar-sm" id="sidebar-avatar">{initial}</div>
          <div className="user-info-sm">
            <span className="user-name-sm" id="user-display">{user?.name || 'Estudiante'}</span>
            <span className="user-xp" id="user-xp">{user?.stats?.xp || 0} XP</span>
          </div>
          <button className="icon-btn-sm" id="btn-logout" title="Cerrar sesión" onClick={confirmLogout}>
            <i className="ri-logout-box-r-line" />
          </button>
        </div>

        <div className="dev-credit">
          <div className="dev-info">
            <span className="dev-name">Mateo Farias</span>
            <span className="dev-role">Desarrollador · StudyFlow+</span>
          </div>
          <div className="dev-links">
            {DEV_LINKS.map((l) => (
              <a key={l.title} href={l.href} target="_blank" title={l.title} rel="noopener noreferrer">
                <i className={l.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

import { useNotifications } from '../context/NotificationsContext.jsx';
import { timeAgo } from '../utils/dates.js';

export default function NotificationPanel({ open, onClose }) {
  const { list, markRead, markAllRead } = useNotifications();

  return (
    <>
      <aside className={`notif-panel${open ? '' : ' hidden'}`} id="notif-panel">
        <div className="notif-panel-header">
          <div className="notif-panel-title">
            <i className="ri-notification-3-line" />
            <h3>Notificaciones</h3>
          </div>
          <div className="notif-panel-actions">
            <button className="btn-text-sm" id="markAllRead" onClick={markAllRead}>Leer todas</button>
            <button className="icon-btn" id="closeNotifPanel" onClick={onClose}>
              <i className="ri-close-line" />
            </button>
          </div>
        </div>

        <div className="notif-list" id="notif-list">
          {list.length === 0 ? (
            <div className="notif-empty">
              <i className="ri-notification-off-line" />
              <p>Sin notificaciones</p>
            </div>
          ) : (
            list.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${n.read ? 'read' : 'unread'} ${n.urgency ? `urgency-${n.urgency}` : ''}`}
                onClick={() => markRead(n.id)}
              >
                {!n.read && <div className="notif-unread-dot" />}
                <div className="notif-title">{n.title}</div>
                <div className="notif-msg">{n.msg}</div>
                <div className="notif-time">{timeAgo(n.timestamp)}</div>
              </div>
            ))
          )}
        </div>
      </aside>
      <div className={`panel-backdrop${open ? '' : ' hidden'}`} id="panel-backdrop" onClick={onClose} />
    </>
  );
}

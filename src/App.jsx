import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import NotificationPanel from './components/NotificationPanel.jsx';
import TaskModal from './components/TaskModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import DashboardView from './views/DashboardView.jsx';
import PlannerView from './views/PlannerView.jsx';
import ConcentrationView from './views/ConcentrationView.jsx';
import TemplatesView from './views/TemplatesView.jsx';
import StudyView from './views/StudyView.jsx';
import ReadingView from './views/ReadingView.jsx';
import VideosView from './views/VideosView.jsx';
import SettingsView from './views/SettingsView.jsx';

export default function App() {
  const { isLoggedIn } = useAuth();
  const { pathname } = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Al cambiar de vista se cierran el menú móvil y el panel de notificaciones.
  useEffect(() => {
    setSidebarOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  // Cierra el panel de notificaciones con Escape.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setNotifOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (!isLoggedIn) return <AuthModal />;

  return (
    <>
      <div className="app-container" id="app-container">
        <Sidebar open={sidebarOpen} />

        <main className="main-content" id="main-content">
          <Header
            onToggleSidebar={() => setSidebarOpen((o) => !o)}
            onToggleNotifications={() => setNotifOpen((o) => !o)}
          />
          <div id="app-view" className="app-view">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/planner" element={<PlannerView />} />
              <Route path="/concentration" element={<ConcentrationView />} />
              <Route path="/templates" element={<TemplatesView />} />
              <Route path="/study" element={<StudyView />} />
              <Route path="/reading" element={<ReadingView />} />
              <Route path="/videos" element={<VideosView />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="*" element={<p style={{ padding: 32 }}>Vista no encontrada.</p>} />
            </Routes>
          </div>
        </main>
      </div>

      <div
        className={`mobile-overlay${sidebarOpen ? '' : ' hidden'}`}
        id="mobileOverlay"
        onClick={() => setSidebarOpen(false)}
      />

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <TaskModal />
    </>
  );
}

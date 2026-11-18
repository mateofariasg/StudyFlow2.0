import { ToastProvider } from './ToastContext.jsx';
import { ThemeProvider } from './ThemeContext.jsx';
import { AuthProvider } from './AuthContext.jsx';
import { TasksProvider } from './TasksContext.jsx';
import { NotificationsProvider } from './NotificationsContext.jsx';
import { TimerProvider } from './TimerContext.jsx';

/* El orden importa: cada proveedor puede usar los que están por encima. */
export default function Providers({ children }) {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <TasksProvider>
            <NotificationsProvider>
              <TimerProvider>{children}</TimerProvider>
            </NotificationsProvider>
          </TasksProvider>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}

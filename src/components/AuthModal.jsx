import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthModal() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        if (!name.trim()) throw new Error('El nombre es obligatorio.');
        await register(name.trim(), email.trim(), password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" id="auth-modal">
      <div className="auth-card">
        <div className="auth-logo-wrap">
          <div className="auth-logo-icon"><i className="ri-flashlight-fill" /></div>
          <h2>StudyFlow<span className="brand-plus">+</span></h2>
          <p>Organiza tu estudio. Mejora tu concentración.</p>
        </div>

        <div className="auth-tabs">
          <button type="button" className={`atab${isLogin ? ' active' : ''}`} onClick={() => switchMode('login')}>
            Iniciar Sesión
          </button>
          <button type="button" className={`atab${!isLogin ? ' active' : ''}`} onClick={() => switchMode('register')}>
            Registrarse
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="field-group">
              <label htmlFor="user-name">Nombre Completo</label>
              <div className="field-wrap">
                <i className="ri-user-3-line" />
                <input
                  type="text"
                  id="user-name"
                  placeholder="Mateo Farias"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="field-group">
            <label htmlFor="user-email">Correo Electrónico</label>
            <div className="field-wrap">
              <i className="ri-mail-line" />
              <input
                type="email"
                id="user-email"
                placeholder="nombre@ejemplo.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="user-password">Contraseña</label>
            <div className="field-wrap">
              <i className="ri-lock-2-line" />
              <input
                type="password"
                id="user-password"
                placeholder="••••••••"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="auth-error" id="auth-error">{error}</p>}

          <button type="submit" className="btn-submit" id="btn-auth-submit" disabled={loading}>
            <span id="auth-btn-label">
              {loading ? 'Cargando...' : isLogin ? 'Acceder al Panel' : 'Crear Cuenta'}
            </span>
            <i className="ri-arrow-right-line" />
          </button>
        </form>
      </div>
    </div>
  );
}

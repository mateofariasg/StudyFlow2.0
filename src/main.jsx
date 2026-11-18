import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';
import './styles/style.css';
import './styles/extra.css';
import Providers from './context/Providers.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* HashRouter: funciona en cualquier hosting estático sin configurar redirecciones. */}
    <HashRouter>
      <Providers>
        <App />
      </Providers>
    </HashRouter>
  </StrictMode>,
);

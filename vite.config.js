import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo las peticiones a /api se reenvían al backend (Render por defecto).
// Así el navegador las ve como "mismo origen" y no choca con la lista de
// orígenes permitidos (CORS) del servidor, que no se modifica.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_PROXY_TARGET || 'https://studyflow2-0.onrender.com';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': { target, changeOrigin: true, secure: target.startsWith('https') },
      },
    },
  };
});

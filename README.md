# StudyFlow+ 2.0 (React)

Frontend migrado de HTML/JS puro a **React 19 + Vite**. El backend (`studyflow-backend/`, Express + MongoDB) **no cambió**: la API es la misma.

## Cómo ejecutarlo

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera dist/
npm run preview    # prueba el build
```

En desarrollo, las peticiones a `/api` pasan por el proxy de Vite hacia el backend de Render (así no choca con CORS).
Para usar otro backend (por ejemplo uno local), crea un archivo `.env`:

```
VITE_PROXY_TARGET=http://localhost:3000   # destino del proxy en desarrollo
VITE_API_URL=https://mi-backend.com/api   # URL fija de la API (producción)
```

## Estructura

```
src/
  main.jsx · App.jsx          arranque, rutas y layout
  views/                      8 vistas (Dashboard, Planificador, Concentración, Plantillas,
                              Método de Estudio, Lectura, Videos, Configuración)
  components/                 Sidebar, Header, modales, lista de tareas
  components/methods/         6 plantillas interactivas (Pomodoro, Feynman, Cornell,
                              Mapa mental, Repetición espaciada, Recall)
  context/                    estado global: Auth, Tasks, Notifications, Timer, Theme, Toast
  hooks/                      useCountdown, useLocalStorage, useMethodData
  services/api.js             acceso al backend
  utils/ · data/ · config/    fechas, técnicas de estudio, menú
legacy/                       versión anterior (HTML/JS) conservada como referencia
```

Las rutas usan `HashRouter` (`/#/dashboard`), por lo que funciona en cualquier hosting estático sin configuración extra.
Los datos guardados en `localStorage` (`sf_study`, `sf_reading`, `sf_method_*`, etc.) mantienen el mismo formato, así que no se pierde nada al migrar.

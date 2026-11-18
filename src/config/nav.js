/* Menú lateral y títulos de cada vista. */

export const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: 'ri-dashboard-3-line' },
      { path: '/planner', label: 'Planificador', icon: 'ri-calendar-2-line' },
      { path: '/concentration', label: 'Concentración', icon: 'ri-focus-3-line' },
    ],
  },
  {
    label: 'Herramientas',
    items: [
      { path: '/templates', label: 'Plantillas', icon: 'ri-layout-grid-line' },
      { path: '/study', label: 'Método de Estudio', icon: 'ri-book-open-line' },
      { path: '/reading', label: 'Reto de Lectura', icon: 'ri-book-2-line' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { path: '/videos', label: 'Videos', icon: 'ri-play-circle-line' },
      { path: '/settings', label: 'Configuración', icon: 'ri-settings-4-line' },
    ],
  },
];

export const VIEW_TITLES = {
  '/dashboard': 'Dashboard',
  '/planner': 'Planificador Inteligente',
  '/concentration': 'Centro de Concentración',
  '/templates': 'Plantillas',
  '/study': 'Método de Estudio',
  '/reading': 'Reto de Lectura',
  '/videos': 'Videos',
  '/settings': 'Configuración',
};

// Enlaces del desarrollador (barra lateral).
// OJO: LinkedIn sigue con el marcador de posición que ya tenía el proyecto;
// reemplaza "TU_LINKEDIN" por tu URL real.
export const DEV_LINKS = [
  { title: 'Instagram', href: 'https://instagram.com/matt_23g', icon: 'ri-instagram-line' },
  { title: 'GitHub', href: 'https://github.com/mateofariasjmv-lgtm', icon: 'ri-github-line' },
  { title: 'LinkedIn', href: 'TU_LINKEDIN', icon: 'ri-linkedin-box-line' },
];

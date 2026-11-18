import { useNavigate } from 'react-router-dom';

const CARDS = [
  {
    to: '/planner',
    color: '#6366f1',
    icon: 'ri-calendar-2-line',
    title: '📅 Planificador Inteligente',
    desc: 'Organiza tus tareas y visualiza tu agenda en vistas de día, semana y mes.',
    pills: ['Agenda Diaria', 'Vista Semanal', 'Calendario Mensual', 'Filtros'],
  },
  {
    to: '/concentration',
    color: '#ef4444',
    icon: 'ri-focus-3-line',
    title: '🎯 Centro de Concentración',
    desc: 'Usa la técnica Pomodoro o el cronómetro para mantener el foco y registrar tus sesiones.',
    pills: ['Pomodoro', 'Cronómetro', 'Historial de Sesiones', 'Estadísticas'],
  },
  {
    to: '/study',
    color: '#f59e0b',
    icon: 'ri-book-open-line',
    title: '📚 Método de Estudio',
    desc: 'Explora 6 técnicas de estudio probadas, marca tus favoritas y añade notas de sesión.',
    pills: ['6 Técnicas', 'Favoritas', 'Notas', 'Técnicas Personalizadas'],
  },
  {
    to: '/reading',
    color: '#10b981',
    icon: 'ri-book-2-line',
    title: '📖 Reto de Lectura',
    desc: 'Establece una meta mensual de libros, registra tu progreso y lleva un historial de lecturas.',
    pills: ['Meta Mensual', 'Mis Libros', 'Progreso', 'Estadísticas'],
  },
];

export default function TemplatesView() {
  const navigate = useNavigate();

  return (
    <>
      <div className="templates-hub-header">
        <div className="view-title">📋 Plantillas</div>
        <div className="view-subtitle">Elige una herramienta y comienza a estudiar con más intención.</div>
      </div>
      <div className="templates-grid">
        {CARDS.map((c) => (
          <div className="template-card" key={c.to} style={{ '--tc-color': c.color }}>
            <div className="tc-icon"><i className={c.icon} /></div>
            <div className="tc-body">
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <div className="tc-features">
                {c.pills.map((p) => <span className="tc-pill" key={p}>{p}</span>)}
              </div>
            </div>
            <button className="tc-btn" onClick={() => navigate(c.to)}>
              Abrir <i className="ri-arrow-right-line" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

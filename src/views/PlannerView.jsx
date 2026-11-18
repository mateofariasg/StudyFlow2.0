import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTasks } from '../context/TasksContext.jsx';
import { addMonths, dateKey, todayKey, weekRange } from '../utils/dates.js';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const PRIORITY_COLORS = { alta: 'var(--red)', media: 'var(--yellow)', baja: 'var(--green)' };

const tasksOn = (tasks, key) => tasks.filter((t) => t.dueDate && dateKey(t.dueDate) === key);

function PlannerTaskRow({ task }) {
  const { toggleTask, openTaskModal, deleteTask } = useTasks();
  return (
    <div className="planner-task-row" onClick={() => openTaskModal(task._id)}>
      <div
        className={`ptask-check task-check ${task.done ? 'done' : ''}`}
        title={task.done ? 'Marcar pendiente' : 'Completar'}
        onClick={(e) => {
          e.stopPropagation();
          toggleTask(task._id, task.done);
        }}
      />
      <div className={`priority-dot pd-${task.priority || 'baja'}`} />
      <div className={`planner-task-text ${task.done ? 'done-text' : ''}`}>{task.text}</div>
      <div className="planner-task-info">
        {task.subject && (
          <>
            <i className="ri-book-line" />{task.subject}
          </>
        )}
      </div>
      <div className="task-actions" style={{ opacity: 1 }}>
        <button
          className="icon-btn ptask-del"
          title="Eliminar"
          style={{ width: 26, height: 26, fontSize: '.8rem', color: 'var(--red)' }}
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task._id);
          }}
        >
          <i className="ri-delete-bin-line" />
        </button>
      </div>
    </div>
  );
}

function DaySection({ date, tasks, today }) {
  const isToday = dateKey(date) === today;
  const label = isToday
    ? '📍 Hoy'
    : date.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div className="planner-day-section">
      <div className="planner-day-label" style={isToday ? { color: 'var(--accent)' } : undefined}>{label}</div>
      <div className="planner-day-tasks">
        {tasks.length === 0 ? (
          <div style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Sin tareas para este día.
          </div>
        ) : (
          tasks.map((t) => <PlannerTaskRow key={t._id} task={t} />)
        )}
      </div>
    </div>
  );
}

function MonthGrid({ date, tasks }) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = (new Date(year, month, 1).getDay() + 6) % 7; // lunes primero
  const today = todayKey();
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="cal-grid">
      <div className="cal-weekdays">
        {WEEKDAYS.map((d) => <div className="cal-wd" key={d}>{d}</div>)}
      </div>
      <div className="cal-days">
        {Array.from({ length: startDow }, (_, i) => <div className="cal-day other-month" key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const key = `${year}-${pad(month + 1)}-${pad(d)}`;
          const dayTasks = tasksOn(tasks, key);
          return (
            <div className={`cal-day${key === today ? ' today' : ''}`} key={key} data-date={key}>
              <div className="cal-day-num">{d}</div>
              {dayTasks.slice(0, 3).map((t) => (
                <span className="cal-dot" key={t._id} style={{ background: PRIORITY_COLORS[t.priority] || 'var(--accent)' }} />
              ))}
              {dayTasks.length > 3 && (
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>+{dayTasks.length - 3}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PlannerView() {
  const { tasks, openTaskModal } = useTasks();
  const [params, setParams] = useSearchParams();

  const [mode, setMode] = useState('week'); // 'day' | 'week' | 'month'
  const [current, setCurrent] = useState(() => new Date());
  const [priority, setPriority] = useState('');

  // El texto de búsqueda vive en la URL (?q=) para que el buscador del encabezado lo comparta.
  const search = params.get('q') || '';
  const setSearch = (value) => setParams(value ? { q: value } : {}, { replace: true });

  const filtered = useMemo(() => {
    let list = tasks;
    if (priority) list = list.filter((t) => t.priority === priority);
    const q = search.toLowerCase();
    if (q) list = list.filter((t) => t.text.toLowerCase().includes(q));
    return list;
  }, [tasks, priority, search]);

  const navigatePeriod = (dir) =>
    setCurrent((d) => {
      if (mode === 'month') return addMonths(d, dir);
      const n = new Date(d);
      n.setDate(n.getDate() + (mode === 'week' ? dir * 7 : dir));
      return n;
    });

  const today = todayKey();
  let label;
  let content;

  if (mode === 'month') {
    label = current.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });
    content = <MonthGrid date={current} tasks={filtered} />;
  } else if (mode === 'week') {
    const { start, end } = weekRange(current);
    label = `${start.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    content = (
      <div className="planner-list">
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          return <DaySection key={dateKey(d)} date={d} tasks={tasksOn(filtered, dateKey(d))} today={today} />;
        })}
      </div>
    );
  } else {
    label = current.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });
    const key = dateKey(current);
    // En "hoy" también se muestran las tareas sin fecha de entrega.
    const noDue = key === today ? filtered.filter((t) => !t.dueDate) : [];
    content = (
      <div className="planner-list">
        <DaySection date={current} tasks={[...tasksOn(filtered, key), ...noDue]} today={today} />
      </div>
    );
  }

  return (
    <>
      <div className="view-title">📅 Planificador Inteligente</div>
      <div className="view-subtitle">Organiza tus tareas, visualiza tu agenda.</div>

      <div className="planner-toolbar">
        <div className="view-tabs">
          {[['day', 'Día'], ['week', 'Semana'], ['month', 'Mes']].map(([id, text]) => (
            <button key={id} className={`vtab ${mode === id ? 'active' : ''}`} onClick={() => setMode(id)}>
              {text}
            </button>
          ))}
        </div>

        <div className="period-nav">
          <button id="prev-period" onClick={() => navigatePeriod(-1)}><i className="ri-arrow-left-s-line" /></button>
          <span id="period-label">{label}</span>
          <button id="next-period" onClick={() => navigatePeriod(1)}><i className="ri-arrow-right-s-line" /></button>
        </div>

        <div className="planner-filters">
          <select id="filter-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Todas las prioridades</option>
            <option value="alta">🔴 Alta</option>
            <option value="media">🟡 Media</option>
            <option value="baja">🟢 Baja</option>
          </select>
          <input
            type="text"
            id="planner-search"
            placeholder="🔍 Buscar tarea..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="btn-primary" id="planner-new-task" onClick={() => openTaskModal()}>
          <i className="ri-add-line" /> Nueva Tarea
        </button>
      </div>

      <div id="planner-content">{content}</div>
    </>
  );
}

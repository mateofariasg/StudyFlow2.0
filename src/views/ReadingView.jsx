import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useNotifications } from '../context/NotificationsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import BookModal from '../components/BookModal.jsx';

const SPINE = {
  quiero: { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', emoji: '📌' },
  leyendo: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', emoji: '📖' },
  completado: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', emoji: '✅' },
};
const STATUS_LABEL = { quiero: '📌 Quiero leer', leyendo: '📖 Leyendo', completado: '✅ Completado' };
const EMPTY_MSG = {
  all: 'Agrega tu primer libro para comenzar el reto.',
  leyendo: 'No tienes libros en progreso.',
  completado: 'Aún no has completado ningún libro este mes.',
  quiero: 'Tu lista de deseos está vacía.',
};

function BookCard({ book: b, onStatus, onEdit, onDelete }) {
  const style = SPINE[b.status] || SPINE.quiero;
  return (
    <div className="book-card">
      <div className="book-top">
        <div className="book-spine" style={{ background: style.bg, color: style.color }}>{style.emoji}</div>
        <div className="book-meta">
          <div className="book-title">{b.title}</div>
          <div className="book-author">{b.author || 'Autor desconocido'}</div>
          {b.pages ? <div className="book-pages">{b.pages} págs.</div> : null}
        </div>
      </div>
      <span className={`book-status-badge bs-${b.status}`}>{STATUS_LABEL[b.status]}</span>
      {b.notes && <div className="book-notes-text">"{b.notes}"</div>}
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        Añadido {new Date(b.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}
      </div>
      <div className="book-actions">
        {b.status === 'quiero' && (
          <button
            className="btn-secondary"
            style={{ flex: 1, fontSize: '0.75rem', padding: 6 }}
            onClick={() => onStatus(b.id, 'leyendo')}
          >
            <i className="ri-book-open-line" /> Empezar
          </button>
        )}
        {b.status === 'leyendo' && (
          <button
            className="btn-primary"
            style={{ flex: 1, fontSize: '0.75rem', padding: 6 }}
            onClick={() => onStatus(b.id, 'completado')}
          >
            <i className="ri-check-line" /> Completar
          </button>
        )}
        <button className="icon-btn" title="Editar" style={{ width: 30, height: 30, fontSize: '.85rem' }} onClick={() => onEdit(b.id)}>
          <i className="ri-edit-line" />
        </button>
        <button
          className="icon-btn"
          title="Eliminar"
          style={{ width: 30, height: 30, fontSize: '.85rem', color: 'var(--red)' }}
          onClick={() => onDelete(b.id)}
        >
          <i className="ri-delete-bin-line" />
        </button>
      </div>
    </div>
  );
}

export default function ReadingView() {
  // Mismo formato de siempre: sf_reading = { books, goal }
  const [store, setStore] = useLocalStorage('sf_reading', { books: [], goal: 5 });
  const books = store.books || [];
  const goal = store.goal || 5;

  const { add: addNotification } = useNotifications();
  const { syncStats } = useAuth();
  const toast = useToast();

  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState({ open: false, bookId: null });

  const count = (status) => books.filter((b) => b.status === status).length;
  const completed = count('completado');
  const reading = count('leyendo');
  const want = count('quiero');
  const pct = Math.min(100, Math.round((completed / goal) * 100)) || 0;
  const list = filter === 'all' ? books : books.filter((b) => b.status === filter);

  const announceCompleted = (title) => {
    addNotification({ title: '📖 ¡Libro completado!', msg: `Terminaste "${title}". ¡Excelente lectura!`, urgency: 4 });
  };

  const changeGoal = () => {
    const ng = parseInt(window.prompt('Nueva meta mensual (libros):', goal), 10);
    if (ng && ng > 0) setStore((s) => ({ ...s, goal: ng }));
  };

  const saveBook = (data) => {
    const id = modal.bookId;
    const prev = id ? books.find((b) => b.id === id) : null;

    setStore((s) => ({
      ...s,
      books: id
        ? (s.books || []).map((b) => (b.id === id ? { ...b, ...data } : b))
        : [{ id: Date.now().toString(), ...data, createdAt: Date.now() }, ...(s.books || [])],
    }));

    // El XP y el aviso solo se dan al PASAR a "completado" (no al volver a editar un libro ya completado).
    if (data.status === 'completado' && prev?.status !== 'completado') {
      announceCompleted(data.title);
      syncStats({ xp: 30 });
    }

    setModal({ open: false, bookId: null });
    toast.success(id ? 'Libro actualizado correctamente.' : 'Lectura registrada correctamente.');
  };

  const changeStatus = (id, status) => {
    const b = books.find((x) => x.id === id);
    if (!b) return;
    setStore((s) => ({ ...s, books: (s.books || []).map((x) => (x.id === id ? { ...x, status } : x)) }));
    if (status === 'completado') {
      announceCompleted(b.title);
      syncStats({ xp: 30 });
      toast.success(`¡Completaste "${b.title}"! 📖`);
    }
  };

  const deleteBook = (id) => {
    const b = books.find((x) => x.id === id);
    if (!b || !window.confirm(`¿Eliminar "${b.title}"?`)) return;
    setStore((s) => ({ ...s, books: (s.books || []).filter((x) => x.id !== id) }));
  };

  const editing = modal.bookId ? books.find((b) => b.id === modal.bookId) : null;

  return (
    <>
      <div className="view-title">📖 Reto de Lectura</div>
      <div className="view-subtitle">Establece tu meta mensual y registra los libros que lees.</div>

      <div className="reading-overview">
        <div className="reading-goal-card">
          <h3><i className="ri-trophy-line" style={{ color: 'var(--yellow)' }} /> Meta del Mes</h3>
          <div className="goal-nums">{completed} <span>/ {goal} libros</span></div>
          <div className="progress-bar" style={{ margin: '8px 0' }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="progress-pct">{pct}% completado</div>
          <button className="btn-secondary" style={{ marginTop: 10, fontSize: '0.78rem', padding: '6px 14px' }} onClick={changeGoal}>
            <i className="ri-edit-line" /> Cambiar meta
          </button>
        </div>

        <div className="reading-goal-card">
          <h3><i className="ri-book-open-line" style={{ color: 'var(--blue)' }} /> Leyendo Ahora</h3>
          <div className="goal-nums">{reading}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {reading === 1 ? 'libro en progreso' : 'libros en progreso'}
          </div>
        </div>

        <div className="reading-goal-card">
          <h3><i className="ri-bookmark-line" style={{ color: 'var(--purple)' }} /> Lista de Deseos</h3>
          <div className="goal-nums">{want}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {want === 1 ? 'libro por leer' : 'libros por leer'}
          </div>
        </div>
      </div>

      <div className="books-header">
        <div className="books-filter">
          {[
            ['all', `Todos (${books.length})`],
            ['leyendo', `Leyendo (${reading})`],
            ['completado', `Completados (${completed})`],
            ['quiero', `Lista (${want})`],
          ].map(([id, label]) => (
            <button key={id} className={`bfilter${filter === id ? ' active' : ''}`} onClick={() => setFilter(id)}>
              {label}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setModal({ open: true, bookId: null })}>
          <i className="ri-add-line" /> Añadir Libro
        </button>
      </div>

      <div className="books-grid" id="books-grid">
        {list.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1', padding: 48 }}>
            <i className="ri-book-2-line" />
            <p>{EMPTY_MSG[filter] || 'Sin libros.'}</p>
            <span>¡Añade un libro para empezar!</span>
          </div>
        ) : (
          list.map((b) => (
            <BookCard
              key={b.id}
              book={b}
              onStatus={changeStatus}
              onEdit={(id) => setModal({ open: true, bookId: id })}
              onDelete={deleteBook}
            />
          ))
        )}
      </div>

      <BookModal
        open={modal.open}
        book={editing}
        onClose={() => setModal({ open: false, bookId: null })}
        onSave={saveBook}
      />
    </>
  );
}

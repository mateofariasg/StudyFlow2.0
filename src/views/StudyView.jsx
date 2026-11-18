import { useState } from 'react';
import { TECHNIQUES, TEMPLATE_IDS } from '../data/techniques.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import MethodModal from '../components/MethodModal.jsx';

const DIFFICULTY = ['Fácil', 'Intermedio', 'Avanzado'];

function TechniqueCard({ t, favorite, onFavorite, onUse }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`technique-card${favorite ? ' favorited' : ''}`}>
      <div className="tc-top">
        <div className="technique-icon" style={{ background: t.bg, color: t.color }}>
          <i className={t.icon} />
        </div>
        <button className={`fav-btn${favorite ? ' active' : ''}`} title="Favorita" onClick={onFavorite}>
          <i className={favorite ? 'ri-star-fill' : 'ri-star-line'} />
        </button>
      </div>
      <div className="technique-name">{t.name}</div>
      <div className="technique-desc">{t.desc}</div>
      <div className="technique-difficulty">
        {[1, 2, 3].map((d) => <div key={d} className={`diff-dot${d <= t.difficulty ? ' filled' : ''}`} />)}
        <span className="diff-label">{DIFFICULTY[t.difficulty - 1]}</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn-secondary"
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: 7 }}
          onClick={() => setOpen((o) => !o)}
        >
          <i className="ri-list-check" /> {open ? 'Ocultar' : 'Ver pasos'}
        </button>
        <button
          className="btn-primary"
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: 7 }}
          onClick={onUse}
        >
          <i className="ri-play-fill" /> Usar
        </button>
      </div>
      <div className={`technique-steps${open ? ' open' : ''}`}>
        <ol>{t.steps.map((s) => <li key={s}>{s}</li>)}</ol>
      </div>
    </div>
  );
}

export default function StudyView() {
  const toast = useToast();
  const { syncStats } = useAuth();

  // Mismo formato de siempre: sf_study = { favorites, notes }
  const [store, setStore] = useLocalStorage('sf_study', { favorites: [], notes: [] });
  const favorites = store.favorites || [];
  const notes = store.notes || [];

  const [custom, setCustom] = useState([]); // las personalizadas viven solo en la sesión, como antes
  const [onlyFav, setOnlyFav] = useState(false);
  const [openMethod, setOpenMethod] = useState(null);
  const [form, setForm] = useState({ method: TECHNIQUES[0].id, subject: '', text: '' });

  const all = [...TECHNIQUES, ...custom];
  const visible = onlyFav ? all.filter((t) => favorites.includes(t.id)) : all;

  const toggleFavorite = (id) =>
    setStore((s) => {
      const favs = s.favorites || [];
      return { ...s, favorites: favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id] };
    });

  const addCustom = () => {
    const name = window.prompt('Nombre de tu técnica personalizada:');
    if (!name?.trim()) return;
    const desc = window.prompt('Descripción breve:') || '';
    setCustom((c) => [
      ...c,
      {
        id: `custom_${Date.now()}`,
        name: name.trim(),
        desc: desc.trim(),
        icon: 'ri-lightbulb-line',
        color: '#6366f1',
        bg: 'rgba(99,102,241,0.12)',
        difficulty: 1,
        steps: ['Define tus pasos personalizados.'],
      },
    ]);
    setOnlyFav(false);
  };

  const useTechnique = (id) => {
    if (TEMPLATE_IDS.includes(id)) setOpenMethod(id);
    else toast.info('Esta técnica personalizada aún no tiene plantilla interactiva.');
  };

  const saveNote = () => {
    const text = form.text.trim();
    if (!text) return toast.warning('Escribe alguna nota primero.');
    const t = all.find((x) => x.id === form.method);
    const note = {
      id: Date.now().toString(),
      method: t?.name || form.method,
      subject: form.subject.trim(),
      text,
      date: Date.now(),
    };
    setStore((s) => ({ ...s, notes: [note, ...(s.notes || [])] }));
    setForm((f) => ({ ...f, subject: '', text: '' }));
    toast.success('Nota de estudio guardada correctamente.');
    syncStats({ xp: 5 });
  };

  const deleteNote = (id) => setStore((s) => ({ ...s, notes: (s.notes || []).filter((n) => n.id !== id) }));

  return (
    <>
      <div className="view-title">📚 Método de Estudio</div>
      <div className="view-subtitle">Elige técnicas, estrategias y registra tu progreso de aprendizaje.</div>

      <div className="study-header">
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {favorites.length > 0 ? (
              <>Tienes <strong style={{ color: 'var(--accent)' }}>{favorites.length}</strong> técnicas favoritas.</>
            ) : (
              'Marca tus técnicas favoritas para acceso rápido.'
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => setOnlyFav((v) => !v)}>
            {onlyFav ? <><i className="ri-layout-grid-line" /> Ver todas</> : <><i className="ri-star-line" /> Solo favoritas</>}
          </button>
          <button className="btn-primary" onClick={addCustom}>
            <i className="ri-add-line" /> Técnica personalizada
          </button>
        </div>
      </div>

      <div className="techniques-grid" id="techniques-grid">
        {visible.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <i className="ri-star-line" />
            <p>Sin favoritas aún. Marca algunas técnicas con ⭐</p>
          </div>
        ) : (
          visible.map((t) => (
            <TechniqueCard
              key={t.id}
              t={t}
              favorite={favorites.includes(t.id)}
              onFavorite={() => toggleFavorite(t.id)}
              onUse={() => useTechnique(t.id)}
            />
          ))
        )}
      </div>

      <div className="card mt-6">
        <div className="card-header">
          <h3><i className="ri-pencil-line" /> Notas de Sesión</h3>
        </div>
        <div className="study-notes-wrap">
          <div className="note-form-card">
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 14 }}>
              <i className="ri-add-circle-line" style={{ color: 'var(--accent)' }} /> Nueva nota
            </h3>
            <div className="field-group" style={{ marginBottom: 10 }}>
              <label>Técnica utilizada</label>
              <select className="field-input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                {all.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                <option value="otra">Otra</option>
              </select>
            </div>
            <div className="field-group" style={{ marginBottom: 10 }}>
              <label>Materia / Tema</label>
              <input
                className="field-input"
                type="text"
                placeholder="Ej: Álgebra — Ecuaciones"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div className="field-group" style={{ marginBottom: 12 }}>
              <label>Notas *</label>
              <textarea
                className="field-input"
                rows="4"
                placeholder="Escribe lo que aprendiste, dificultades encontradas..."
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={saveNote}>
              <i className="ri-save-line" /> Guardar nota
            </button>
          </div>

          <div className="notes-list-card">
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 14 }}>
              <i className="ri-history-line" style={{ color: 'var(--accent)' }} /> Historial
            </h3>
            <div id="notes-list">
              {notes.length === 0 ? (
                <div className="empty-state" style={{ padding: 20 }}>
                  <i className="ri-sticky-note-line" />
                  <p>Sin notas guardadas</p>
                </div>
              ) : (
                notes.slice(0, 15).map((n) => (
                  <div className="note-item" key={n.id}>
                    <div className="note-item-method">{n.method}</div>
                    {n.subject && <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: 3 }}>{n.subject}</div>}
                    <div className="note-item-text">{n.text}</div>
                    <div className="note-item-date">
                      {new Date(n.date).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <button className="note-delete" title="Eliminar" onClick={() => deleteNote(n.id)}>
                      <i className="ri-close-line" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {openMethod && <MethodModal methodId={openMethod} onClose={() => setOpenMethod(null)} />}
    </>
  );
}

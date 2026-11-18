import { useEffect, useRef, useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';

const EMPTY = { title: '', author: '', pages: '', status: 'quiero', notes: '' };

/** Modal para añadir o editar un libro. `book` = libro a editar (o null). */
export default function BookModal({ open, book, onClose, onSave }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const titleRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      book
        ? {
            title: book.title || '',
            author: book.author || '',
            pages: book.pages || '',
            status: book.status || 'quiero',
            notes: book.notes || '',
          }
        : EMPTY,
    );
    titleRef.current?.focus();
  }, [open, book]);

  if (!open) return null;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) {
      toast.warning('El título es obligatorio.');
      return;
    }
    onSave({
      title,
      author: form.author.trim(),
      pages: parseInt(form.pages, 10) || null,
      status: form.status,
      notes: form.notes.trim(),
    });
  };

  return (
    <div className="modal-overlay" id="book-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-card-header">
          <h3 id="book-modal-title">
            {book ? (
              <><i className="ri-edit-line" /> Editar Libro</>
            ) : (
              <><i className="ri-book-2-line" /> Añadir Libro</>
            )}
          </h3>
          <button type="button" className="icon-btn" id="close-book-modal" onClick={onClose}>
            <i className="ri-close-line" />
          </button>
        </div>

        <form id="book-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label>Título *</label>
            <input
              ref={titleRef}
              className="field-input"
              type="text"
              id="book-title"
              placeholder="Ej: El Poder de los Hábitos"
              value={form.title}
              onChange={set('title')}
              required
            />
          </div>
          <div className="form-row">
            <div className="field-group">
              <label>Autor</label>
              <input
                className="field-input"
                type="text"
                id="book-author"
                placeholder="Ej: Charles Duhigg"
                value={form.author}
                onChange={set('author')}
              />
            </div>
            <div className="field-group">
              <label>Páginas</label>
              <input
                className="field-input"
                type="number"
                id="book-pages"
                placeholder="320"
                min="1"
                value={form.pages}
                onChange={set('pages')}
              />
            </div>
          </div>
          <div className="field-group">
            <label>Estado</label>
            <select className="field-input" id="book-status" value={form.status} onChange={set('status')}>
              <option value="quiero">📌 Quiero leer</option>
              <option value="leyendo">📖 Leyendo</option>
              <option value="completado">✅ Completado</option>
            </select>
          </div>
          <div className="field-group">
            <label>Notas</label>
            <textarea
              className="field-input"
              id="book-notes"
              rows="2"
              placeholder="Anotaciones personales..."
              value={form.notes}
              onChange={set('notes')}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" id="cancel-book-modal" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <i className="ri-save-line" /> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

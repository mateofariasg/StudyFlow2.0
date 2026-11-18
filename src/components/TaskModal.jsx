import { useEffect, useRef, useState } from 'react';
import { useTasks } from '../context/TasksContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { toLocalInput } from '../utils/dates.js';

const EMPTY = {
  text: '',
  description: '',
  priority: 'media',
  category: 'Académica',
  subject: '',
  dueDate: '',
};

function defaultDue() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 0, 0);
  return toLocalInput(tomorrow);
}

export default function TaskModal() {
  const { tasks, modal, closeTaskModal, saveTask } = useTasks();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const textRef = useRef(null);

  const editing = modal.taskId ? tasks.find((t) => t._id === modal.taskId) : null;

  // Al abrir el modal se llena el formulario (tarea existente o valores por defecto).
  useEffect(() => {
    if (!modal.open) return;
    if (modal.taskId) {
      const t = tasks.find((x) => x._id === modal.taskId);
      if (!t) {
        closeTaskModal();
        return;
      }
      setForm({
        text: t.text || '',
        description: t.description || '',
        priority: t.priority || 'media',
        category: t.category || 'Académica',
        subject: t.subject || '',
        dueDate: t.dueDate ? toLocalInput(t.dueDate) : '',
      });
    } else {
      setForm({ ...EMPTY, dueDate: defaultDue() });
    }
    textRef.current?.focus();
    // Solo al abrir / cambiar de tarea; no queremos pisar lo que el usuario escribe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.open, modal.taskId]);

  if (!modal.open) return null;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.text.trim()) {
      toast.warning('El nombre de la tarea es obligatorio.');
      return;
    }
    saveTask({ id: editing?._id || '', ...form });
  };

  return (
    <div
      className="modal-overlay"
      id="task-modal"
      onClick={(e) => e.target === e.currentTarget && closeTaskModal()}
    >
      <div className="modal-card">
        <div className="modal-card-header">
          <h3 id="task-modal-title">
            {editing ? (
              <><i className="ri-edit-line" /> Editar Tarea</>
            ) : (
              <><i className="ri-add-circle-line" /> Nueva Tarea</>
            )}
          </h3>
          <button type="button" className="icon-btn" id="close-task-modal" onClick={closeTaskModal}>
            <i className="ri-close-line" />
          </button>
        </div>

        <form id="task-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label>Nombre de la tarea *</label>
            <input
              ref={textRef}
              className="field-input"
              type="text"
              id="task-text"
              placeholder="Ej: Estudiar para examen de Física"
              value={form.text}
              onChange={set('text')}
              required
            />
          </div>
          <div className="field-group">
            <label>Descripción</label>
            <textarea
              className="field-input"
              id="task-description"
              rows="2"
              placeholder="Detalles adicionales..."
              value={form.description}
              onChange={set('description')}
            />
          </div>
          <div className="form-row">
            <div className="field-group">
              <label>Prioridad</label>
              <select className="field-input" id="task-priority" value={form.priority} onChange={set('priority')}>
                <option value="alta">🔴 Alta</option>
                <option value="media">🟡 Media</option>
                <option value="baja">🟢 Baja</option>
              </select>
            </div>
            <div className="field-group">
              <label>Categoría</label>
              <select className="field-input" id="task-category" value={form.category} onChange={set('category')}>
                <option value="Académica">📚 Académica</option>
                <option value="Personal">👤 Personal</option>
                <option value="Proyecto">🚀 Proyecto</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field-group">
              <label>Materia</label>
              <input
                className="field-input"
                type="text"
                id="task-subject"
                placeholder="Ej: Matemáticas"
                value={form.subject}
                onChange={set('subject')}
              />
            </div>
            <div className="field-group">
              <label>Fecha de entrega</label>
              <input
                className="field-input"
                type="datetime-local"
                id="task-due"
                value={form.dueDate}
                onChange={set('dueDate')}
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" id="cancel-task-modal" onClick={closeTaskModal}>
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

import { useMethodData } from '../../hooks/useMethodData.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function CornellTemplate({ onSaved }) {
  const { data, update, saveNow } = useMethodData('cornell', onSaved);
  const { syncStats } = useAuth();
  const toast = useToast();

  const bind = (field) => ({
    value: data[field] || '',
    onChange: (e) => update({ [field]: e.target.value }),
  });

  const handleSave = () => {
    saveNow();
    toast.success('Apuntes Cornell guardados correctamente.');
    syncStats({ xp: 15 });
  };

  return (
    <>
      <div className="mt-intro">
        Sistema de apuntes estructurado: ideas clave, notas detalladas y un resumen final.
      </div>
      <div className="mt-field">
        <label>📚 Materia / Tema</label>
        <input id="cor-topic" className="field-input" placeholder="Ej: Historia — Revolución Francesa" {...bind('topic')} />
      </div>
      <div className="cornell-grid">
        <div className="cornell-cues">
          <div className="cornell-label">💡 Ideas clave / Preguntas</div>
          <textarea
            id="cor-cues"
            className="field-input"
            placeholder="Palabras clave, preguntas, conceptos principales..."
            {...bind('cues')}
          />
        </div>
        <div className="cornell-notes">
          <div className="cornell-label">📝 Apuntes detallados</div>
          <textarea
            id="cor-notes"
            className="field-input"
            placeholder="Toma tus notas completas aquí durante la clase..."
            {...bind('notes')}
          />
        </div>
      </div>
      <div className="cornell-summary">
        <div className="cornell-label">📌 Resumen</div>
        <textarea
          id="cor-summary"
          className="field-input"
          rows="3"
          placeholder="Resume todo en 2-3 frases con tus propias palabras..."
          {...bind('summary')}
        />
      </div>
      <button type="button" className="btn-primary" id="cor-save" style={{ width: '100%' }} onClick={handleSave}>
        <i className="ri-save-line" /> Guardar apuntes Cornell
      </button>
    </>
  );
}

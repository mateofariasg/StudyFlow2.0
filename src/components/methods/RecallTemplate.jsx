import { useMethodData } from '../../hooks/useMethodData.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function RecallTemplate({ onSaved }) {
  const { data, update, saveNow } = useMethodData('recall', onSaved);
  const { syncStats } = useAuth();
  const toast = useToast();

  const bind = (field) => ({
    value: data[field] || '',
    onChange: (e) => update({ [field]: e.target.value }),
  });

  const handleSave = () => {
    saveNow();
    toast.success('Sesión de Recall Activo guardada correctamente.');
    syncStats({ xp: 15 });
  };

  return (
    <>
      <div className="mt-intro">
        Cierra el libro y escribe lo que recuerdas. Luego compara y corrige. Refuerza las conexiones neuronales.
      </div>
      <div className="mt-field">
        <label>📚 Tema estudiado</label>
        <input id="rec-topic" className="field-input" placeholder="Ej: Las leyes de Newton" {...bind('topic')} />
      </div>
      <div className="mt-field">
        <label>🧠 Lo que recuerdo (sin mirar apuntes)</label>
        <textarea
          id="rec-remember"
          className="field-input"
          rows="5"
          placeholder="Escribe todo lo que recuerdes de memoria..."
          {...bind('remember')}
        />
      </div>
      <div className="recall-two-col">
        <div className="mt-field">
          <label>❌ Lo que olvidé</label>
          <textarea
            id="rec-forgot"
            className="field-input"
            rows="4"
            placeholder="Tras revisar, ¿qué se te escapó?"
            {...bind('forgot')}
          />
        </div>
        <div className="mt-field">
          <label>✏️ Corrección</label>
          <textarea
            id="rec-correction"
            className="field-input"
            rows="4"
            placeholder="Versión corregida y completa"
            {...bind('correction')}
          />
        </div>
      </div>
      <div className="mt-field">
        <label>🏁 Resultado final (resumen)</label>
        <textarea
          id="rec-result"
          className="field-input"
          rows="3"
          placeholder="Tu comprensión consolidada del tema"
          {...bind('result')}
        />
      </div>
      <button type="button" className="btn-primary" id="rec-save" style={{ width: '100%' }} onClick={handleSave}>
        <i className="ri-save-line" /> Guardar sesión de Recall
      </button>
    </>
  );
}

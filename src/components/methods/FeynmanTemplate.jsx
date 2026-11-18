import { useMethodData } from '../../hooks/useMethodData.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function FeynmanTemplate({ onSaved }) {
  const { data, update, saveNow } = useMethodData('feynman', onSaved);
  const { syncStats } = useAuth();
  const toast = useToast();

  // Siempre hay al menos una fila de vacíos para escribir.
  const gaps = data.gaps && data.gaps.length ? data.gaps : [''];

  const setGap = (i, value) => update({ gaps: gaps.map((g, idx) => (idx === i ? value : g)) });
  const addGap = () => update({ gaps: [...gaps, ''] });
  const removeGap = (i) => saveNow({ gaps: gaps.filter((_, idx) => idx !== i) });

  const handleSave = () => {
    // Igual que antes: al guardar se descartan los vacíos que quedaron en blanco.
    saveNow({ gaps: gaps.filter((g) => g.trim()) });
    toast.success('Explicación Feynman guardada correctamente.');
    syncStats({ xp: 15 });
  };

  return (
    <>
      <div className="mt-intro">
        Aprende explicando con tus propias palabras. Si no puedes explicarlo simple, aún no lo entiendes.
      </div>
      <div className="mt-field">
        <label>1️⃣ Concepto a estudiar</label>
        <input
          id="fey-concept"
          className="field-input"
          placeholder="Ej: La fotosíntesis"
          value={data.concept || ''}
          onChange={(e) => update({ concept: e.target.value })}
        />
      </div>
      <div className="mt-field">
        <label>2️⃣ Explícalo como si enseñaras a un niño</label>
        <textarea
          id="fey-explain"
          className="field-input"
          rows="5"
          placeholder="Usa palabras simples, sin tecnicismos..."
          value={data.explain || ''}
          onChange={(e) => update({ explain: e.target.value })}
        />
      </div>
      <div className="mt-field">
        <label>
          3️⃣ Detecta vacíos de conocimiento{' '}
          <button type="button" className="mt-add-btn" id="fey-add-gap" onClick={addGap}>
            <i className="ri-add-line" /> Añadir
          </button>
        </label>
        <div id="fey-gaps">
          {gaps.map((g, i) => (
            <div className="mt-gap-row" key={i}>
              <input
                className="field-input fey-gap"
                placeholder="¿Qué no quedó claro?"
                value={g}
                onChange={(e) => setGap(i, e.target.value)}
              />
              <button
                type="button"
                className="icon-btn fey-del-gap"
                style={{ width: 34, height: 34, color: 'var(--toast-error)' }}
                onClick={() => removeGap(i)}
              >
                <i className="ri-close-line" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-field">
        <label>4️⃣ Explicación final mejorada</label>
        <textarea
          id="fey-final"
          className="field-input"
          rows="5"
          placeholder="Reescribe la explicación llenando los vacíos..."
          value={data.final || ''}
          onChange={(e) => update({ final: e.target.value })}
        />
      </div>
      <button type="button" className="btn-primary" id="fey-save" style={{ width: '100%' }} onClick={handleSave}>
        <i className="ri-save-line" /> Guardar explicación
      </button>
    </>
  );
}

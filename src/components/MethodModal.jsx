import { useCallback, useEffect, useRef, useState } from 'react';
import { METHOD_META } from '../data/techniques.js';
import { useToast } from '../context/ToastContext.jsx';
import PomodoroTemplate from './methods/PomodoroTemplate.jsx';
import FeynmanTemplate from './methods/FeynmanTemplate.jsx';
import CornellTemplate from './methods/CornellTemplate.jsx';
import MindmapTemplate from './methods/MindmapTemplate.jsx';
import SpacedTemplate from './methods/SpacedTemplate.jsx';
import RecallTemplate from './methods/RecallTemplate.jsx';

const TEMPLATES = {
  pomodoro: PomodoroTemplate,
  feynman: FeynmanTemplate,
  cornell: CornellTemplate,
  mindmap: MindmapTemplate,
  spaced: SpacedTemplate,
  recall: RecallTemplate,
};

/** Ventana con la plantilla interactiva de un método de estudio. */
export default function MethodModal({ methodId, onClose }) {
  const toast = useToast();
  const [flash, setFlash] = useState(false);
  const flashTimer = useRef(null);

  const meta = METHOD_META[methodId] || { emoji: '📚', name: 'Método' };
  const Template = TEMPLATES[methodId];

  // Aviso al abrir (una sola vez por apertura).
  useEffect(() => {
    toast.info(`Plantilla "${meta.name}" abierta. Tu progreso se guarda automáticamente.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methodId]);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  // Cierra con la tecla Escape.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onSaved = useCallback(() => {
    setFlash(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(false), 600);
  }, []);

  return (
    <div id="method-template-overlay" className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="method-template-card">
        <div className="method-template-header">
          <h3 id="method-template-title">
            <span style={{ fontSize: '1.3rem' }}>{meta.emoji}</span> {meta.name}
          </h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`method-saved-badge${flash ? ' flash' : ''}`} id="method-saved-badge">
              <i className="ri-checkbox-circle-line" /> Guardado
            </span>
            <button className="icon-btn" id="method-template-close" onClick={onClose}>
              <i className="ri-close-line" />
            </button>
          </div>
        </div>
        <div className="method-template-body" id="method-template-body">
          {Template ? <Template onSaved={onSaved} /> : <p>Plantilla no disponible.</p>}
        </div>
      </div>
    </div>
  );
}

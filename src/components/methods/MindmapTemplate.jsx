import { useMethodData } from '../../hooks/useMethodData.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function MindmapTemplate({ onSaved }) {
  const { data, update, saveNow } = useMethodData('mindmap', onSaved);
  const { syncStats } = useAuth();
  const toast = useToast();

  const central = data.central || '';
  const nodes = data.nodes || [];

  const setNodes = (fn, immediate = false) => {
    const patch = (d) => ({ ...d, nodes: fn(d.nodes || []) });
    return immediate ? saveNow(patch) : update(patch);
  };

  const setNodeText = (i, text) => setNodes((ns) => ns.map((n, idx) => (idx === i ? { ...n, text } : n)));
  const setSub = (i, j, value) =>
    setNodes((ns) =>
      ns.map((n, idx) => (idx === i ? { ...n, subs: (n.subs || []).map((s, k) => (k === j ? value : s)) } : n)),
    );

  const addBranch = () => setNodes((ns) => [...ns, { text: '', subs: [] }], true);
  const addSub = (i) =>
    setNodes((ns) => ns.map((n, idx) => (idx === i ? { ...n, subs: [...(n.subs || []), ''] } : n)), true);
  const removeBranch = (i) => setNodes((ns) => ns.filter((_, idx) => idx !== i), true);
  const removeSub = (i, j) =>
    setNodes(
      (ns) => ns.map((n, idx) => (idx === i ? { ...n, subs: (n.subs || []).filter((_, k) => k !== j) } : n)),
      true,
    );

  const handleSave = () => {
    // Al guardar se descartan ramas y subnodos vacíos, como en la versión anterior.
    saveNow((d) => ({
      ...d,
      nodes: (d.nodes || [])
        .map((n) => ({ text: n.text || '', subs: (n.subs || []).filter((s) => s.trim()) }))
        .filter((n) => n.text.trim() || n.subs.length),
    }));
    toast.success('Mapa mental guardado correctamente.');
    syncStats({ xp: 15 });
  };

  return (
    <>
      <div className="mt-intro">
        Organiza ideas conectadas desde un concepto central. Versión funcional basada en tarjetas conectadas.
      </div>
      <div className="mt-field">
        <label>🎯 Nodo central</label>
        <input
          id="mm-central"
          className="field-input"
          placeholder="Ej: Sistema Solar"
          value={central}
          onChange={(e) => update({ central: e.target.value })}
        />
      </div>
      <div className="mindmap-canvas" id="mm-canvas">
        <div className="mm-central-node" id="mm-central-display">{central || 'Tu idea central'}</div>
        <div className="mm-branches" id="mm-branches">
          {nodes.map((n, i) => (
            <div className="mm-branch" key={i}>
              <div className="mm-branch-head">
                <input
                  className="field-input mm-node"
                  placeholder="Rama principal"
                  value={n.text || ''}
                  onChange={(e) => setNodeText(i, e.target.value)}
                />
                <button
                  type="button"
                  className="icon-btn mm-add-sub"
                  title="Añadir subnodo"
                  style={{ width: 34, height: 34 }}
                  onClick={() => addSub(i)}
                >
                  <i className="ri-node-tree" />
                </button>
                <button
                  type="button"
                  className="icon-btn mm-del-node"
                  title="Eliminar"
                  style={{ width: 34, height: 34, color: 'var(--toast-error)' }}
                  onClick={() => removeBranch(i)}
                >
                  <i className="ri-close-line" />
                </button>
              </div>
              <div className="mm-subs">
                {(n.subs || []).map((s, j) => (
                  <div className="mm-sub" key={j}>
                    <input
                      className="field-input mm-subnode"
                      placeholder="Subnodo"
                      value={s}
                      onChange={(e) => setSub(i, j, e.target.value)}
                    />
                    <button type="button" className="mm-del-sub" onClick={() => removeSub(i, j)}>
                      <i className="ri-close-line" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button type="button" className="mt-add-btn-lg" id="mm-add" onClick={addBranch}>
        <i className="ri-add-line" /> Añadir rama / subnodo
      </button>
      <button type="button" className="btn-primary" id="mm-save" style={{ width: '100%', marginTop: 12 }} onClick={handleSave}>
        <i className="ri-save-line" /> Guardar mapa mental
      </button>
    </>
  );
}

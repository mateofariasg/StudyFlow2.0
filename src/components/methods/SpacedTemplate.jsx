import { useState } from 'react';
import { useMethodData } from '../../hooks/useMethodData.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { addDaysToKey, parseLocalDate, todayKey } from '../../utils/dates.js';

const INTERVALS = [1, 3, 7, 15, 30];

export default function SpacedTemplate({ onSaved }) {
  const { data, saveNow } = useMethodData('spaced', onSaved);
  const { syncStats } = useAuth();
  const toast = useToast();

  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(todayKey());

  const items = data.items || [];
  const today = todayKey();

  const addPlan = () => {
    const name = topic.trim();
    if (!name) return toast.warning('Escribe el tema estudiado.');
    if (!date) return toast.warning('Selecciona la fecha de estudio.');

    const reviews = INTERVALS.map((interval) => ({
      interval,
      date: addDaysToKey(date, interval),
      done: false,
    }));
    saveNow((d) => ({ ...d, items: [{ topic: name, date, reviews }, ...(d.items || [])] }));
    setTopic('');
    toast.success('Calendario de repasos generado.');
    syncStats({ xp: 10 });
  };

  const toggleReview = (i, rdate) =>
    saveNow((d) => ({
      ...d,
      items: (d.items || []).map((it, idx) =>
        idx !== i
          ? it
          : { ...it, reviews: it.reviews.map((r) => (r.date === rdate ? { ...r, done: !r.done } : r)) },
      ),
    }));

  const removeItem = (i) => saveNow((d) => ({ ...d, items: (d.items || []).filter((_, idx) => idx !== i) }));

  return (
    <>
      <div className="mt-intro">
        Repasa en intervalos crecientes (1, 3, 7, 15, 30 días) para fijar la memoria a largo plazo.
      </div>
      <div className="spaced-form">
        <input
          id="sp-topic"
          className="field-input"
          placeholder="Tema estudiado (ej: Verbos irregulares)"
          style={{ flex: 2 }}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <input
          id="sp-date"
          type="date"
          className="field-input"
          style={{ flex: 1 }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button type="button" className="btn-primary" id="sp-add" onClick={addPlan}>
          <i className="ri-add-line" /> Generar plan
        </button>
      </div>

      <div className="spaced-list" id="sp-list">
        {items.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <i className="ri-calendar-line" />
            <p>Sin temas. Añade uno para generar su calendario de repasos.</p>
          </div>
        ) : (
          items.map((it, i) => (
            <div className="spaced-item" key={`${it.topic}-${it.date}-${i}`}>
              <div className="spaced-item-head">
                <div>
                  <div className="spaced-topic">{it.topic}</div>
                  <div className="spaced-start">
                    Estudiado:{' '}
                    {parseLocalDate(it.date).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <button
                  type="button"
                  className="icon-btn sp-del"
                  style={{ width: 30, height: 30, color: 'var(--toast-error)' }}
                  onClick={() => removeItem(i)}
                >
                  <i className="ri-delete-bin-line" />
                </button>
              </div>
              <div className="spaced-reviews">
                {it.reviews.map((r) => {
                  const overdue = !r.done && r.date < today;
                  const isToday = r.date === today;
                  return (
                    <div
                      key={r.date}
                      className={`spaced-review ${r.done ? 'done' : ''} ${overdue ? 'overdue' : ''} ${isToday ? 'today' : ''}`}
                      onClick={() => toggleReview(i, r.date)}
                    >
                      <i className={r.done ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'} />
                      <span>
                        +{r.interval}d · {parseLocalDate(r.date).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';

const KEY = (id) => `sf_method_${id}`;

function read(id) {
  try {
    return JSON.parse(localStorage.getItem(KEY(id)) || '{}');
  } catch {
    return {};
  }
}

function write(id, data) {
  try {
    localStorage.setItem(KEY(id), JSON.stringify(data));
  } catch {
    /* sin almacenamiento disponible */
  }
}

/**
 * Datos de una plantilla de estudio con guardado automático (600 ms después
 * de dejar de escribir) en localStorage `sf_method_<id>` — mismo formato que antes.
 *
 *  - data:    datos actuales
 *  - update:  cambia datos y programa el guardado automático
 *  - saveNow: cambia datos y guarda de inmediato
 */
export function useMethodData(id, onSaved) {
  const [data, setData] = useState(() => read(id));
  const dataRef = useRef(data);
  const timer = useRef(null);
  const savedCb = useRef(onSaved);
  savedCb.current = onSaved;

  const commit = useCallback(
    (next) => {
      dataRef.current = next;
      setData(next);
    },
    [],
  );

  const persist = useCallback(() => {
    write(id, dataRef.current);
    savedCb.current?.();
  }, [id]);

  const resolve = (patch) =>
    typeof patch === 'function' ? patch(dataRef.current) : { ...dataRef.current, ...patch };

  const update = useCallback(
    (patch) => {
      commit(resolve(patch));
      clearTimeout(timer.current);
      timer.current = setTimeout(persist, 600);
    },
    [commit, persist],
  );

  const saveNow = useCallback(
    (patch = {}) => {
      clearTimeout(timer.current);
      commit(resolve(patch));
      persist();
    },
    [commit, persist],
  );

  // Si se cierra la plantilla con un guardado pendiente, se guarda al salir.
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        write(id, dataRef.current);
      }
    },
    [id],
  );

  return { data, update, saveNow };
}

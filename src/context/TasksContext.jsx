import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(isLoggedIn);
  const [modal, setModal] = useState({ open: false, taskId: null });

  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const load = useCallback(async () => {
    if (!api.isLoggedIn()) return;
    try {
      const data = await api.getTasks();
      if (data.success) setTasks(data.tasks || []);
    } catch (e) {
      console.warn('[Tasks] No se pudo cargar desde el servidor:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga al iniciar sesión y vacía al cerrarla.
  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      load();
    } else {
      setTasks([]);
      setLoading(false);
      setModal({ open: false, taskId: null });
    }
  }, [isLoggedIn, load]);

  const openTaskModal = useCallback((taskId = null) => setModal({ open: true, taskId }), []);
  const closeTaskModal = useCallback(() => setModal({ open: false, taskId: null }), []);

  const saveTask = useCallback(
    async (form) => {
      if (!api.isLoggedIn()) return;
      const id = form.id;
      const payload = {
        text: form.text.trim(),
        description: form.description.trim(),
        priority: form.priority,
        category: form.category,
        subject: form.subject.trim(),
        dueDate: form.dueDate || null,
      };

      try {
        if (id) {
          const data = await api.updateTask(id, payload);
          if (data.success) setTasks((list) => list.map((t) => (t._id === id ? data.task : t)));
        } else {
          const data = await api.createTask(payload);
          if (data.success) setTasks((list) => [data.task, ...list]);
        }
        closeTaskModal();
        toast.success(id ? 'Tarea actualizada correctamente.' : 'Tarea creada correctamente.');
      } catch (e) {
        toast.error(`No se pudo guardar: ${e.message}`);
      }
    },
    [closeTaskModal, toast],
  );

  const toggleTask = useCallback(
    async (id, currentDone) => {
      try {
        const data = await api.updateTask(id, { done: !currentDone });
        if (data.success) {
          setTasks((list) => list.map((t) => (t._id === id ? data.task : t)));
          // "Tareas completadas" se deriva del estado real (no se acumula en el servidor),
          // así marcar/desmarcar/re-marcar nunca duplica el conteo.
          if (!currentDone) toast.success(`Completaste: "${data.task.text}"`);
        }
      } catch (e) {
        toast.error('No se pudo actualizar la tarea.');
        console.error(e);
      }
    },
    [toast],
  );

  const deleteTask = useCallback(
    async (id) => {
      const task = tasksRef.current.find((t) => t._id === id);
      if (!task) return;
      if (!window.confirm(`¿Eliminar "${task.text}"?`)) return;
      try {
        const data = await api.deleteTask(id);
        if (data.success) {
          setTasks((list) => list.filter((t) => t._id !== id));
          toast.info('Tarea eliminada.');
        }
      } catch (e) {
        toast.error(`No se pudo eliminar: ${e.message}`);
      }
    },
    [toast],
  );

  const value = useMemo(
    () => ({
      tasks,
      loading,
      modal,
      openTaskModal,
      closeTaskModal,
      saveTask,
      toggleTask,
      deleteTask,
      reload: load,
    }),
    [tasks, loading, modal, openTaskModal, closeTaskModal, saveTask, toggleTask, deleteTask, load],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks debe usarse dentro de <TasksProvider>');
  return ctx;
}

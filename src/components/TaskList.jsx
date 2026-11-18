import { useTasks } from '../context/TasksContext.jsx';
import { dueLabel } from '../utils/dates.js';

function TaskItem({ task }) {
  const { toggleTask, openTaskModal, deleteTask } = useTasks();
  const due = task.dueDate ? dueLabel(task.dueDate) : null;

  return (
    <div className="task-item">
      <div
        className={`task-check ${task.done ? 'done' : ''}`}
        title={task.done ? 'Marcar pendiente' : 'Marcar completada'}
        onClick={(e) => {
          e.stopPropagation();
          toggleTask(task._id, task.done);
        }}
      />
      <div className="task-body">
        <div className={`task-name ${task.done ? 'done-text' : ''}`}>{task.text}</div>
        <div className="task-meta">
          <span className={`task-badge badge-${task.priority}`}>{task.priority}</span>
          {task.subject && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{task.subject}</span>}
          {due && (
            <span className={`task-due ${due.cls}`}>
              <i className="ri-time-line" />{due.label}
            </span>
          )}
        </div>
      </div>
      <div className="task-actions">
        <button
          className="icon-btn btn-edit-task"
          title="Editar"
          style={{ width: 28, height: 28, fontSize: '.85rem' }}
          onClick={(e) => {
            e.stopPropagation();
            openTaskModal(task._id);
          }}
        >
          <i className="ri-edit-line" />
        </button>
        <button
          className="icon-btn btn-del-task"
          title="Eliminar"
          style={{ width: 28, height: 28, fontSize: '.85rem', color: 'var(--red)' }}
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task._id);
          }}
        >
          <i className="ri-delete-bin-line" />
        </button>
      </div>
    </div>
  );
}

/** Lista compacta de tareas (hasta 8), con estado vacío. */
export default function TaskList({ tasks }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="empty-state">
        <i className="ri-checkbox-circle-line" />
        <p>Sin tareas pendientes</p>
        <span>¡Excelente trabajo!</span>
      </div>
    );
  }
  return tasks.slice(0, 8).map((t) => <TaskItem key={t._id} task={t} />);
}

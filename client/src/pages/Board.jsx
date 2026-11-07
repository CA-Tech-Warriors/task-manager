import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { taskApi } from '../api';
import { STATUSES, STATUS_DONE } from '../config';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/dates';
import ViewSwitch from '../components/ViewSwitch';
import { CalendarIcon, PlusIcon } from '../components/Icons';
import { ErrorBanner, PageLoader, PriorityBadge } from '../components/ui';

export default function Board() {
  const showToast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      setTasks(await taskApi.list({ sortBy: 'dueDate', order: 'asc' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const move = async (task, status) => {
    setBusyId(task.id);
    // Update the card right away, then confirm with the server.
    setTasks((list) => list.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      await taskApi.update(task.id, { ...task, status });
      const label = STATUSES.find((s) => s.value === status)?.label;
      showToast(`Moved to ${label}: ${task.title}`);
    } catch (err) {
      showToast(err.message, 'error');
      await load();
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <PageLoader label="Loading your board" />;

  const done = tasks.filter((t) => t.status === STATUS_DONE).length;
  const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="page__inner">
      <div className="page-head">
        <div>
          <h1 className="page-title">My tasks</h1>
          <p className="muted">
            {done} of {tasks.length} tasks done ({percent}%)
          </p>
        </div>
        <div className="page-head__actions">
          <ViewSwitch current="board" />
          <Link to="/tasks/new" className="btn btn--primary">
            <PlusIcon />
            New task
          </Link>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      <div
        className="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Tasks done"
      >
        <div className="progress__bar" style={{ width: `${percent}%` }} />
      </div>

      <div className="board">
        {STATUSES.map((column, index) => {
          const cards = tasks.filter((t) => t.status === column.value);
          const prev = STATUSES[index - 1];
          const next = STATUSES[index + 1];
          return (
            <section key={column.value} className="board__column" aria-labelledby={`col-${column.value}`}>
              <div className="board__head">
                <h2 id={`col-${column.value}`} className="board__title">
                  <span className={`dot dot--status-${column.value}`} aria-hidden="true" />
                  {column.label}
                </h2>
                <span className="board__count">{cards.length}</span>
              </div>

              {cards.map((task) => (
                <article key={task.id} className="board-card">
                  <Link
                    to={`/tasks/${task.id}`}
                    className={`board-card__title${column.value === STATUS_DONE ? ' board-card__title--done' : ''}`}
                  >
                    {task.title}
                  </Link>
                  <div className="board-card__meta">
                    <PriorityBadge value={task.priority} />
                    <span className="due">
                      <CalendarIcon />
                      {task.dueDate ? formatDate(task.dueDate) : 'No date'}
                    </span>
                  </div>
                  <div className="board-card__moves">
                    {prev && (
                      <button
                        type="button"
                        className="btn btn--small btn--secondary"
                        disabled={busyId === task.id}
                        onClick={() => move(task, prev.value)}
                        aria-label={`Move ${task.title} to ${prev.label}`}
                      >
                        ← {prev.label}
                      </button>
                    )}
                    {next && (
                      <button
                        type="button"
                        className="btn btn--small btn--soft"
                        disabled={busyId === task.id}
                        onClick={() => move(task, next.value)}
                        aria-label={`Move ${task.title} to ${next.label}`}
                      >
                        {next.label} →
                      </button>
                    )}
                  </div>
                </article>
              ))}

              {index === 0 && (
                <Link to="/tasks/new" className="board__add">
                  + Add a task
                </Link>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

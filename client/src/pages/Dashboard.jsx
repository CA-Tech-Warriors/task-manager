import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { taskApi } from '../api';
import { PRIORITIES, STATUSES, STATUS_DONE, STATUS_TODO } from '../config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, isDueWithin, isOverdue } from '../utils/dates';
import { useDebouncedValue } from '../utils/hooks';
import EmptyState from '../components/EmptyState';
import ViewSwitch from '../components/ViewSwitch';
import { CalendarIcon, CheckIcon, EditIcon, PlusIcon, SearchIcon, TrashIcon } from '../components/Icons';
import { ErrorBanner, PageLoader, PriorityBadge, Spinner, StatusBadge } from '../components/ui';

const SORTS = [
  { value: 'dueDate:asc', label: 'Due date, soonest' },
  { value: 'dueDate:desc', label: 'Due date, latest' },
  { value: 'createdAt:desc', label: 'Created, newest' },
  { value: 'createdAt:asc', label: 'Created, oldest' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const showToast = useToast();

  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState(SORTS[0].value);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim());

  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const latest = useRef(0);

  const [sortBy, order] = sort.split(':');
  const hasFilters = Boolean(status || priority || search);

  // The list uses the API's filters; counts always come from the full list.
  const load = useCallback(async () => {
    const id = ++latest.current;
    setRefreshing(true);
    setError('');
    try {
      const params = { status, priority, search, sortBy, order };
      const [list, all] = await Promise.all([taskApi.list(params), hasFilters ? taskApi.list() : null]);
      if (id !== latest.current) return;
      setTasks(list);
      setAllTasks(all ?? list);
    } catch (err) {
      if (id === latest.current) setError(err.message);
    } finally {
      if (id === latest.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [status, priority, search, sortBy, order, hasFilters]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleDone = async (task) => {
    const next = task.status === STATUS_DONE ? STATUS_TODO : STATUS_DONE;
    setBusyId(task.id);
    try {
      await taskApi.update(task.id, { ...task, status: next });
      showToast(next === STATUS_DONE ? `Marked as done: ${task.title}` : `Moved back to To do: ${task.title}`);
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (task) => {
    setBusyId(task.id);
    try {
      await taskApi.remove(task.id);
      setConfirmId(null);
      showToast(`Task deleted: ${task.title}`);
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <PageLoader label="Loading your tasks" />;

  const count = (value) => allTasks.filter((t) => t.status === value).length;
  const doneCount = count(STATUS_DONE);
  const openCount = allTasks.length - doneCount;
  const dueSoon = allTasks.filter((t) => t.status !== STATUS_DONE && isDueWithin(t.dueDate, 7)).length;
  const isBrandNew = !error && allTasks.length === 0 && !hasFilters;

  return (
    <div className="page__inner">
      <div className="page-head">
        <div>
          <h1 className="page-title">{isBrandNew ? `Welcome, ${user?.username}` : 'My tasks'}</h1>
          <p className="muted">
            {isBrandNew ? "Your account is ready. Let's add your first task." : `${openCount} open, ${doneCount} done`}
          </p>
        </div>
        {!isBrandNew && (
          <div className="page-head__actions">
            <ViewSwitch current="list" />
            <Link to="/tasks/new" className="btn btn--primary">
              <PlusIcon />
              New task
            </Link>
          </div>
        )}
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {isBrandNew ? (
        <EmptyState />
      ) : (
        <>
          <section className="stats" aria-label="Task summary">
            {STATUSES.map((s) => (
              <div key={s.value} className="card stat">
                <span className="stat__label">{s.label}</span>
                <span className={`stat__value stat__value--${s.value}`}>{count(s.value)}</span>
              </div>
            ))}
            <div className="card stat">
              <span className="stat__label">Due in the next 7 days</span>
              <span className="stat__value stat__value--due">{dueSoon}</span>
            </div>
          </section>

          <section className="card list-card" aria-label="Tasks">
            <div className="toolbar">
              <label className="search">
                <SearchIcon />
                <span className="visually-hidden">Search tasks</span>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search title or description"
                />
              </label>

              <div className="chips" role="group" aria-label="Filter by status">
                <button
                  type="button"
                  className={`chip${status === '' ? ' chip--on' : ''}`}
                  aria-pressed={status === ''}
                  onClick={() => setStatus('')}
                >
                  All {allTasks.length}
                </button>
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`chip${status === s.value ? ' chip--on' : ''}`}
                    aria-pressed={status === s.value}
                    onClick={() => setStatus(s.value)}
                  >
                    {s.label} {count(s.value)}
                  </button>
                ))}
              </div>

              <div className="toolbar__end">
                {refreshing && <Spinner label="Updating list" />}
                <label className="select-label">
                  Priority
                  <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="">Any</option>
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="select-label">
                  Sort
                  <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
                    {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="no-results">
                <p className="no-results__title">No tasks match</p>
                <p className="muted">Try a different search, status or priority.</p>
              </div>
            ) : (
              <ul className="task-list" aria-label="Task list">
                {tasks.map((task) => {
                  const done = task.status === STATUS_DONE;
                  const busy = busyId === task.id;
                  const overdue = !done && isOverdue(task.dueDate);
                  return (
                    <li key={task.id} className={`task-row${done ? ' task-row--done' : ''}`}>
                      <button
                        type="button"
                        className="check-button"
                        onClick={() => toggleDone(task)}
                        disabled={busy}
                        aria-pressed={done}
                        aria-label={`${done ? 'Mark as not done' : 'Mark as done'}: ${task.title}`}
                      >
                        <span className={`checkbox-visual${done ? ' checkbox-visual--on' : ''}`}>
                          {done && <CheckIcon />}
                        </span>
                      </button>
                      <div className="task-row__main">
                        <Link to={`/tasks/${task.id}`} className="task-row__title">
                          {task.title}
                        </Link>
                        {task.description && <span className="task-row__desc">{task.description}</span>}
                      </div>
                      <div className="task-row__meta">
                        <PriorityBadge value={task.priority} />
                        <StatusBadge value={task.status} />
                        <span className={`due${overdue ? ' due--overdue' : ''}`}>
                          <CalendarIcon />
                          {task.dueDate ? `${overdue ? 'Overdue, ' : ''}${formatDate(task.dueDate)}` : 'No date'}
                        </span>
                      </div>
                      <div className="task-row__actions">
                        {confirmId === task.id ? (
                          <>
                            <span className="confirm-text">Delete?</span>
                            <button
                              type="button"
                              className="btn btn--small btn--danger"
                              onClick={() => remove(task)}
                              disabled={busy}
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              className="btn btn--small btn--secondary"
                              onClick={() => setConfirmId(null)}
                            >
                              Keep
                            </button>
                          </>
                        ) : (
                          <>
                            <Link to={`/tasks/${task.id}`} className="icon-button" aria-label={`Edit ${task.title}`}>
                              <EditIcon />
                            </Link>
                            <button
                              type="button"
                              className="icon-button icon-button--danger"
                              onClick={() => setConfirmId(task.id)}
                              aria-label={`Delete ${task.title}`}
                            >
                              <TrashIcon />
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

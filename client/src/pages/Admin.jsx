import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/dates';
import { ErrorBanner, PageLoader, PriorityBadge, StatusBadge } from '../components/ui';

export default function Admin() {
  const { user } = useAuth();
  const showToast = useToast();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmKey, setConfirmKey] = useState(null);
  const [busyKey, setBusyKey] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const [u, t] = await Promise.all([adminApi.users(), adminApi.tasks()]);
      setUsers(u);
      setTasks(t);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (kind, item) => {
    const key = `${kind}-${item.id}`;
    setBusyKey(key);
    try {
      if (kind === 'user') await adminApi.deleteUser(item.id);
      else await adminApi.deleteTask(item.id);
      showToast(kind === 'user' ? `User deleted: ${item.username}` : `Task deleted: ${item.title}`);
      setConfirmKey(null);
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyKey(null);
    }
  };

  const deleteControls = (kind, item, label) => {
    const key = `${kind}-${item.id}`;
    if (confirmKey === key) {
      return (
        <span className="row-confirm">
          <button
            type="button"
            className="btn btn--small btn--danger"
            disabled={busyKey === key}
            onClick={() => remove(kind, item)}
          >
            Confirm
          </button>
          <button type="button" className="btn btn--small btn--secondary" onClick={() => setConfirmKey(null)}>
            Cancel
          </button>
        </span>
      );
    }
    return (
      <button
        type="button"
        className="btn btn--small btn--danger-outline"
        onClick={() => setConfirmKey(key)}
        aria-label={`Delete ${label}`}
      >
        Delete
      </button>
    );
  };

  const ownerName = (task) =>
    task.owner || users.find((u) => String(u.id) === String(task.userId))?.username || 'Unknown';
  const taskCount = (u) => tasks.filter((t) => String(t.userId) === String(u.id) || t.owner === u.username).length;

  if (loading) return <PageLoader label="Loading admin data" />;

  return (
    <div className="page__inner">
      <div className="page-head page-head--stack">
        <h1 className="page-title">Admin</h1>
        <p className="muted">Manage every account and task in the app. Only admins can see this page.</p>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      <div className="tabs" role="tablist" aria-label="Admin sections">
        {[
          ['users', `Users ${users.length}`],
          ['tasks', `All tasks ${tasks.length}`],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            className={`tab${tab === id ? ' tab--on' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <section id="panel-users" role="tabpanel" aria-labelledby="tab-users" className="card table-card">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col" className="num">
                    Tasks
                  </th>
                  <th scope="col">Joined</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isMe = String(u.id) === String(user?.id);
                  return (
                    <tr key={u.id}>
                      <td>
                        <span className="user-cell">
                          <span className="avatar" aria-hidden="true">
                            {(u.username || '?').charAt(0).toUpperCase()}
                          </span>
                          <strong>{u.username}</strong>
                          {isMe && <span className="muted">(you)</span>}
                        </span>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge--admin' : 'badge--neutral'}`}>
                          {u.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="num">{taskCount(u)}</td>
                      <td>{formatDate(u.createdAt, { year: true }) || 'Unknown'}</td>
                      <td className="actions">{!isMe && deleteControls('user', u, `user ${u.username}`)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'tasks' && (
        <section id="panel-tasks" role="tabpanel" aria-labelledby="tab-tasks" className="card table-card">
          {tasks.length === 0 ? (
            <div className="no-results">
              <p className="no-results__title">No tasks yet</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Task</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Status</th>
                    <th scope="col">Due</th>
                    <th scope="col">
                      <span className="visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <strong>{t.title}</strong>
                      </td>
                      <td>{ownerName(t)}</td>
                      <td>
                        <PriorityBadge value={t.priority} />
                      </td>
                      <td>
                        <StatusBadge value={t.status} />
                      </td>
                      <td>{formatDate(t.dueDate) || 'No date'}</td>
                      <td className="actions">{deleteControls('task', t, `task ${t.title}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

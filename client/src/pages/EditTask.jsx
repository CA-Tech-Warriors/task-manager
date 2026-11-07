import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { taskApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/dates';
import { BackLink } from '../components/Layouts';
import TaskForm from '../components/TaskForm';
import { BusyButton, ErrorBanner, PageLoader } from '../components/ui';

export default function EditTask() {
  const { taskId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const showToast = useToast();
  const [task, setTask] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    taskApi
      .get(taskId)
      .then((t) => active && setTask(t))
      .catch((err) => active && setError(err));
    return () => {
      active = false;
    };
  }, [taskId]);

  const handleSave = async (values) => {
    await taskApi.update(taskId, values);
    showToast('Changes saved');
    navigate('/dashboard');
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await taskApi.remove(taskId);
      showToast(`Task deleted: ${task.title}`);
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message, 'error');
      setDeleting(false);
    }
  };

  if (error) {
    const missing = error.status === 404 || error.status === 403;
    return (
      <div className="page__inner page__inner--narrow">
        <BackLink to="/dashboard">Back to my tasks</BackLink>
        {missing ? (
          <section className="card empty">
            <h1 className="empty__title">Task not found</h1>
            <p className="empty__text">It may have been deleted, or it belongs to another account.</p>
            <Link to="/dashboard" className="btn btn--primary">
              Go to my tasks
            </Link>
          </section>
        ) : (
          <ErrorBanner message={error.message} onRetry={() => window.location.reload()} />
        )}
      </div>
    );
  }

  if (!task) return <PageLoader label="Loading task" />;

  const aside = (
    <>
      <section className="card side-card" aria-label="About this task">
        <dl className="meta-list">
          <div>
            <dt>Owner</dt>
            <dd>{task.owner || user?.username}</dd>
          </div>
          {task.createdAt && (
            <div>
              <dt>Created</dt>
              <dd>{formatDate(task.createdAt, { year: true })}</dd>
            </div>
          )}
          {task.updatedAt && (
            <div>
              <dt>Last updated</dt>
              <dd>{formatDate(task.updatedAt, { year: true })}</dd>
            </div>
          )}
        </dl>
      </section>
      <section className="card side-card side-card--danger" aria-label="Delete task">
        <h2 className="side-card__heading">Delete this task</h2>
        <p className="muted">This can't be undone.</p>
        {confirming ? (
          <div className="confirm-box">
            <p className="confirm-box__text">Delete "{task.title}"?</p>
            <div className="confirm-box__actions">
              <button type="button" className="btn btn--secondary" onClick={() => setConfirming(false)}>
                Keep it
              </button>
              <BusyButton
                type="button"
                busy={deleting}
                busyLabel="Deleting"
                className="btn btn--danger"
                onClick={handleDelete}
              >
                Delete
              </BusyButton>
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn--danger-outline" onClick={() => setConfirming(true)}>
            Delete task
          </button>
        )}
      </section>
    </>
  );

  return (
    <div className="page__inner page__inner--narrow">
      <BackLink to="/dashboard">Back to my tasks</BackLink>
      <div className="page-head page-head--stack">
        <h1 className="page-title">Edit task</h1>
      </div>
      <TaskForm initial={task} submitLabel="Save changes" busyLabel="Saving" onSubmit={handleSave} aside={aside} />
    </div>
  );
}

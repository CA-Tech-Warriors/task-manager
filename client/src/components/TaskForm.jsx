import { useState } from 'react';
import { DESCRIPTION_MAX, PRIORITIES, STATUSES, TITLE_MAX } from '../config';
import { formatDate, todayISO, toISODate } from '../utils/dates';
import { validateTask } from '../utils/validation';
import { BusyButton, FieldError, PriorityBadge, StatusBadge } from './ui';
import { PlusIcon } from './Icons';
import { Link } from 'react-router-dom';

const EMPTY_TASK = {
  title: '',
  description: '',
  status: STATUSES[0].value,
  priority: PRIORITIES[1].value,
  dueDate: '',
};

const quickDates = () => [
  { label: 'Today', value: todayISO(0) },
  { label: 'Tomorrow', value: todayISO(1) },
  { label: 'Next week', value: todayISO(7) },
  { label: 'No date', value: '' },
];

// Shared by Create task and Edit task. onSubmit receives the values and
// may throw an ApiError; its field errors are shown under the matching inputs.
export default function TaskForm({
  initial,
  submitLabel,
  busyLabel,
  onSubmit,
  showPreview = false,
  aside = null,
  cancelTo = '/dashboard',
}) {
  const [task, setTask] = useState(() => ({ ...EMPTY_TASK, ...initial, dueDate: toISODate(initial?.dueDate) }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const set = (field) => (event) => setTask((t) => ({ ...t, [field]: event.target.value }));
  const choose = (field, value) => () => setTask((t) => ({ ...t, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateTask(task);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) {
      document.getElementById(`task-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      await onSubmit(task);
    } catch (err) {
      setErrors(err.fields || {});
      setFormError(err.message);
      setBusy(false);
    }
  };

  const title = task.title.trim();

  return (
    <div className="split">
      <form className="card form-card split__main" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="alert alert--error" role="alert">
            <span className="alert__text">{formError}</span>
          </div>
        )}

        <div className="field">
          <div className="field__top">
            <label htmlFor="task-title" className="field__label">
              Title{' '}
              <span className="required" aria-hidden="true">
                *
              </span>
            </label>
            <span className="field__count">
              {task.title.length} / {TITLE_MAX}
            </span>
          </div>
          <input
            id="task-title"
            className="input input--title"
            value={task.title}
            onChange={set('title')}
            maxLength={TITLE_MAX}
            required
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'task-title-error' : undefined}
            placeholder="What needs doing?"
            autoFocus={!initial?.title}
          />
          <FieldError id="task-title-error" message={errors.title} />
        </div>

        <div className="field">
          <div className="field__top">
            <label htmlFor="task-description" className="field__label">
              Description <span className="field__optional">(optional)</span>
            </label>
            <span className="field__count">
              {task.description.length} / {DESCRIPTION_MAX}
            </span>
          </div>
          <textarea
            id="task-description"
            className="input textarea"
            rows={4}
            value={task.description}
            onChange={set('description')}
            maxLength={DESCRIPTION_MAX}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'task-description-error' : undefined}
            placeholder="Add details, links or notes"
          />
          <FieldError id="task-description-error" message={errors.description} />
        </div>

        <fieldset className="field">
          <legend className="field__label">Priority</legend>
          <div className="choice-grid">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                className={`choice${task.priority === p.value ? ' choice--on' : ''}`}
                aria-pressed={task.priority === p.value}
                onClick={choose('priority', p.value)}
              >
                <span className="choice__name">
                  <span className={`dot dot--${p.value}`} aria-hidden="true" />
                  {p.label}
                </span>
                <span className="choice__hint">{p.hint}</span>
              </button>
            ))}
          </div>
          <FieldError id="task-priority-error" message={errors.priority} />
        </fieldset>

        <fieldset className="field">
          <legend className="field__label">Status</legend>
          <div className="segmented">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                className={`segmented__option${task.status === s.value ? ' segmented__option--on' : ''}`}
                aria-pressed={task.status === s.value}
                onClick={choose('status', s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <FieldError id="task-status-error" message={errors.status} />
        </fieldset>

        <div className="field">
          <label htmlFor="task-dueDate" className="field__label">
            Due date <span className="field__optional">(optional)</span>
          </label>
          <div className="date-row">
            <input
              id="task-dueDate"
              type="date"
              className="input input--date"
              value={task.dueDate}
              onChange={set('dueDate')}
            />
            {quickDates().map((q) => (
              <button
                key={q.label}
                type="button"
                className={`pill${task.dueDate === q.value ? ' pill--on' : ''}`}
                aria-pressed={task.dueDate === q.value}
                onClick={choose('dueDate', q.value)}
              >
                {q.label}
              </button>
            ))}
          </div>
          <FieldError id="task-dueDate-error" message={errors.dueDate} />
        </div>

        <div className="form-actions">
          <Link to={cancelTo} className="btn btn--secondary">
            Cancel
          </Link>
          <BusyButton type="submit" busy={busy} busyLabel={busyLabel}>
            {!initial?.id && <PlusIcon />}
            {submitLabel}
          </BusyButton>
        </div>
      </form>

      {(showPreview || aside) && (
        <aside className="split__side">
          {showPreview && (
            <>
              <section className="card side-card" aria-label="Preview">
                <h2 className="side-card__title">How it will look</h2>
                <div className="preview-row">
                  <span className="checkbox-visual" aria-hidden="true" />
                  <div className="preview-row__body">
                    <span className={`preview-row__title${title ? '' : ' preview-row__title--empty'}`}>
                      {title || 'Untitled task'}
                    </span>
                    {task.description.trim() && <span className="preview-row__desc">{task.description}</span>}
                    <span className="preview-row__meta">
                      <PriorityBadge value={task.priority} />
                      <StatusBadge value={task.status} />
                      <span>{task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}</span>
                    </span>
                  </div>
                </div>
              </section>
              <section className="tips" aria-label="Tips">
                <h2 className="tips__title">Tips</h2>
                <p>Start the title with a verb, like "Write" or "Deploy", so it reads as an action.</p>
                <p>Add a due date so the task shows up when you sort the dashboard by due date.</p>
              </section>
            </>
          )}
          {aside}
        </aside>
      )}
    </div>
  );
}

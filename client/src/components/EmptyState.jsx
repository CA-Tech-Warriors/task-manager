import { Link } from 'react-router-dom';
import { PlusIcon } from './Icons';

const STEPS = [
  { title: 'Add a task', text: 'A title is all you need to start.' },
  { title: 'Set priority and due date', text: 'So the urgent work sorts to the top.' },
  { title: 'Move it along', text: 'Use the board to go from To do to Done.' },
];

// Shown on the dashboard until the user has created their first task.
export default function EmptyState() {
  return (
    <>
      <section className="card empty" aria-label="No tasks yet">
        <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
          <rect x="18" y="10" width="84" height="76" rx="12" fill="var(--teal-soft)" />
          <rect x="30" y="26" width="12" height="12" rx="3.5" stroke="var(--teal)" strokeWidth="2.5" />
          <path d="M50 32h38" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round" />
          <rect x="30" y="46" width="12" height="12" rx="3.5" stroke="#94A3B8" strokeWidth="2.5" />
          <path d="M50 52h28" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <rect x="30" y="66" width="12" height="12" rx="3.5" stroke="#CBD5E1" strokeWidth="2.5" />
          <path d="M50 72h20" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <h2 className="empty__title">No tasks yet</h2>
        <p className="empty__text">
          Add something you need to get done. Give it a priority and a due date, and it will show up here sorted for
          you.
        </p>
        <Link to="/tasks/new" className="btn btn--primary btn--large">
          <PlusIcon />
          Create your first task
        </Link>
      </section>
      <ol className="steps" aria-label="Getting started">
        {STEPS.map((step, i) => (
          <li key={step.title} className="card step">
            <span className={`step__num${i === 0 ? ' step__num--on' : ''}`} aria-hidden="true">
              {i + 1}
            </span>
            <span className="step__body">
              <span className="step__title">{step.title}</span>
              <span className="muted">{step.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

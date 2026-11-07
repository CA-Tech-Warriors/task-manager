import { Link } from 'react-router-dom';
import { PublicHeader } from '../components/Layouts';
import { CheckIcon, DateIcon, FilterIcon, LockIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: FilterIcon,
    title: 'Filter, sort, search',
    text: 'Narrow the list by status or priority, sort by created or due date, and search titles and descriptions.',
  },
  {
    icon: DateIcon,
    title: 'Priorities and due dates',
    text: 'Give each task a priority and a deadline so the urgent work rises to the top.',
  },
  {
    icon: LockIcon,
    title: 'Private by default',
    text: 'Your tasks belong to your account. Nobody else can view or change them.',
  },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="public">
      <PublicHeader showActions />
      <main id="main">
        <section className="hero">
          <div className="hero__copy">
            <h1 className="hero__title">Know what to work on next.</h1>
            <p className="hero__lead">
              Keep every task in one list with priorities, due dates and status. Filter, sort and search it in seconds,
              and only you can see your tasks.
            </p>
            <div className="hero__actions">
              {user ? (
                <Link to="/dashboard" className="btn btn--primary btn--large">
                  Open my tasks
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn--primary btn--large">
                    Create your account
                  </Link>
                  <Link to="/login" className="btn btn--secondary btn--large">
                    I already have one
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hero__preview" aria-hidden="true">
            <div className="hero__preview-head">
              <span className="hero__preview-title">My tasks</span>
              <span className="muted">Sorted by due date</span>
            </div>
            <div className="mini-task">
              <span className="checkbox-visual" />
              <span className="mini-task__title">Deploy API to Render</span>
              <span className="badge badge--priority-high">High</span>
            </div>
            <div className="mini-task">
              <span className="checkbox-visual" />
              <span className="mini-task__title">Write README screenshots section</span>
              <span className="badge badge--priority-medium">Medium</span>
            </div>
            <div className="mini-task mini-task--done">
              <span className="checkbox-visual checkbox-visual--on">
                <CheckIcon />
              </span>
              <span className="mini-task__title">Hash passwords with bcrypt</span>
              <span className="badge badge--status-done">Done</span>
            </div>
          </div>
        </section>

        <section className="features" aria-label="Features">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="feature">
              <Icon />
              <h2 className="feature__title">{title}</h2>
              <p>{text}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <span>Task Manager, a full-stack bootcamp project</span>
        </div>
      </footer>
    </div>
  );
}

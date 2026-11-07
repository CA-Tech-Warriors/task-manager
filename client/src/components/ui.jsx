import { priorityLabel, statusLabel } from '../config';
import { AlertIcon } from './Icons';

export const PriorityBadge = ({ value }) => (
  <span className={`badge badge--priority-${value}`}>{priorityLabel(value)}</span>
);

export const StatusBadge = ({ value }) => <span className={`badge badge--status-${value}`}>{statusLabel(value)}</span>;

export const Spinner = ({ label = 'Loading' }) => <span className="spinner" role="img" aria-label={label} />;

export function PageLoader({ label = 'Loading' }) {
  return (
    <div className="page-loader">
      <Spinner label={label} />
      <span>{label}…</span>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="alert alert--error" role="alert">
      <AlertIcon />
      <span className="alert__text">{message}</span>
      {onRetry && (
        <button type="button" className="btn btn--small btn--secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

// A submit button that shows a spinner and a different label while busy.
export function BusyButton({ busy, busyLabel, children, className = 'btn btn--primary', ...rest }) {
  return (
    <button className={className} disabled={busy} aria-busy={busy} {...rest}>
      {busy && <Spinner label={busyLabel} />}
      {busy ? busyLabel : children}
    </button>
  );
}

export const FieldError = ({ id, message }) =>
  message ? (
    <span id={id} className="field__error">
      <AlertIcon size={14} />
      {message}
    </span>
  ) : null;

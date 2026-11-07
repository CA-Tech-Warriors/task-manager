import { Link } from 'react-router-dom';
import { BoardIcon, ListIcon } from './Icons';

export default function ViewSwitch({ current }) {
  const option = (view, to, Icon, label) => (
    <Link
      to={to}
      className={`segmented__option segmented__option--link${current === view ? ' segmented__option--on' : ''}`}
      aria-current={current === view ? 'page' : undefined}
    >
      <Icon />
      {label}
    </Link>
  );
  return (
    <nav className="segmented" aria-label="View">
      {option('list', '/dashboard', ListIcon, 'List')}
      {option('board', '/board', BoardIcon, 'Board')}
    </nav>
  );
}

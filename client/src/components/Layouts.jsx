import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo, MoonIcon, SunIcon } from './Icons';

export function Brand({ to = '/' }) {
  return (
    <Link to={to} className="brand">
      <Logo />
      Task Manager
    </Link>
  );
}

const THEME_STORAGE_KEY = 'task-manager-theme';

function getInitialTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark' || currentTheme === 'light') {
    return currentTheme;
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function ThemeToggleButton() {
  const [theme, setTheme] = useState(getInitialTheme);
  const nextThemeLabel = theme === 'dark' ? 'light' : 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      aria-label={`Switch to ${nextThemeLabel} mode`}
      title={`Switch to ${nextThemeLabel} mode`}
      onClick={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

// Header for public pages. The landing page shows the sign-up buttons.
export function PublicHeader({ showActions = false }) {
  const { user } = useAuth();
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Brand to={user ? '/dashboard' : '/'} />
        <div className="site-header__end">
          <ThemeToggleButton />
          {showActions &&
            (user ? (
              <Link to="/dashboard" className="btn btn--primary">
                Open my tasks
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn--ghost">
                  Log in
                </Link>
                <Link to="/register" className="btn btn--primary">
                  Sign up free
                </Link>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}

const TASK_PATHS = ['/dashboard', '/board', '/tasks'];

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onTasks = TASK_PATHS.some((p) => pathname.startsWith(p));

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const navClass = ({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`;

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <Brand to="/dashboard" />
          <nav aria-label="Main" className="main-nav">
            <Link
              to="/dashboard"
              className={navClass({ isActive: onTasks })}
              aria-current={onTasks ? 'page' : undefined}
            >
              Dashboard
            </Link>
            <NavLink to="/profile" className={navClass}>
              Profile
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={navClass}>
                Admin
              </NavLink>
            )}
          </nav>
          <div className="site-header__end">
            <ThemeToggleButton />
            <span className="user-chip">
              <span className="avatar" aria-hidden="true">
                {(user?.username || '?').charAt(0).toUpperCase()}
              </span>
              {user?.username}
            </span>
            <button type="button" className="btn btn--ghost" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>
      <main id="main" className="page">
        <Outlet />
      </main>
    </>
  );
}

export function BackLink({ to, children }) {
  return (
    <Link to={to} className="back-link">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 6l-6 6 6 6" />
      </svg>
      {children}
    </Link>
  );
}
